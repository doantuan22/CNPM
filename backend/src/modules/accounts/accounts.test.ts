import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { createTestAccount, deleteTestAccount } from '../../test/factories';
import { ROLE_NAMES } from '../../common/constants/roles';
import { ACCOUNT_STATUS } from '../../common/constants/account-status';
import { PARTNER_APPLICATION_STATUS } from '../../common/constants/account-status';
import { getPrismaClient } from '../../config/prisma';

const createdAccountIds: number[] = [];
afterAll(async () => {
  const prisma = getPrismaClient();
  await Promise.all(
    createdAccountIds.map((id) =>
      prisma.hO_SO_DOI_TAC.deleteMany({ where: { MaTaiKhoan: id } }).then(() => deleteTestAccount(id))
    )
  );
});

const loginAndGetToken = async (email: string, password: string) => {
  const res = await request(app).post('/api/auth/login').send({ identifier: email, MatKhau: password });
  return res.body.data.accessToken as string;
};

const makeAdminToken = async () => {
  const { account, plainPassword } = await createTestAccount({ role: ROLE_NAMES.ADMIN });
  createdAccountIds.push(account.MaTaiKhoan);
  return { account, token: await loginAndGetToken(account.Email, plainPassword) };
};

describe('RBAC on /api/admin/accounts', () => {
  it('rejects a customer token with 403', async () => {
    const { account, plainPassword } = await createTestAccount({ role: ROLE_NAMES.CUSTOMER });
    createdAccountIds.push(account.MaTaiKhoan);
    const token = await loginAndGetToken(account.Email, plainPassword);

    const res = await request(app).get('/api/admin/accounts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('allows an admin token', async () => {
    const { token } = await makeAdminToken();
    const res = await request(app).get('/api/admin/accounts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('rejects requests with no token at all', async () => {
    const res = await request(app).get('/api/admin/accounts');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/admin/accounts (list/search)', () => {
  it('lists accounts with pagination metadata', async () => {
    const { token } = await makeAdminToken();
    const res = await request(app).get('/api/admin/accounts?page=1&limit=5').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 5 });
  });

  it('finds a specific account by search term', async () => {
    const { token } = await makeAdminToken();
    const { account } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);

    const res = await request(app)
      .get(`/api/admin/accounts?search=${account.TenDangNhap}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((a: { MaTaiKhoan: number }) => a.MaTaiKhoan === account.MaTaiKhoan)).toBe(
      true
    );
  });
});

describe('PATCH /api/admin/accounts/:id (update)', () => {
  it('updates an account', async () => {
    const { token } = await makeAdminToken();
    const { account } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);

    const res = await request(app)
      .patch(`/api/admin/accounts/${account.MaTaiKhoan}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ HoTen: 'Admin Edited Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.HoTen).toBe('Admin Edited Name');
  });
});

describe('POST /api/admin/accounts/:id/lock', () => {
  it('locks an account, and the locked account can no longer log in', async () => {
    const { token } = await makeAdminToken();
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);

    const lockRes = await request(app)
      .post(`/api/admin/accounts/${account.MaTaiKhoan}/lock`)
      .set('Authorization', `Bearer ${token}`);
    expect(lockRes.status).toBe(200);
    expect(lockRes.body.data.TrangThai).toBe(ACCOUNT_STATUS.LOCKED);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ identifier: account.Email, MatKhau: plainPassword });
    expect(loginRes.status).toBe(403);
  });
});

describe('DELETE /api/admin/accounts/:id (safe delete)', () => {
  it('hard-deletes an account with no related history', async () => {
    const { token } = await makeAdminToken();
    const { account } = await createTestAccount();

    const res = await request(app)
      .delete(`/api/admin/accounts/${account.MaTaiKhoan}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.hardDeleted).toBe(true);

    const prisma = getPrismaClient();
    const row = await prisma.tAI_KHOAN.findUnique({ where: { MaTaiKhoan: account.MaTaiKhoan } });
    expect(row).toBeNull();
    // Not pushed to createdAccountIds — it no longer exists, nothing to clean up.
  });

  it('locks instead of hard-deleting an account that has related history (G0-10)', async () => {
    const { token } = await makeAdminToken();
    const { account } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);

    const prisma = getPrismaClient();
    await prisma.hO_SO_DOI_TAC.create({
      data: {
        SoCCCD: '000000000',
        SoGiayPhepKinhDoanh: 'GP-TEST',
        MaSoThue: 'MST-TEST',
        TepGiayTo: '/doc.pdf',
        TrangThaiDuyet: PARTNER_APPLICATION_STATUS.PENDING,
        NgayNop: new Date(),
        TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN: { connect: { MaTaiKhoan: account.MaTaiKhoan } },
      },
    });

    const res = await request(app)
      .delete(`/api/admin/accounts/${account.MaTaiKhoan}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.hardDeleted).toBe(false);

    const row = await prisma.tAI_KHOAN.findUnique({ where: { MaTaiKhoan: account.MaTaiKhoan } });
    expect(row?.TrangThai).toBe(ACCOUNT_STATUS.LOCKED);
  });
});
