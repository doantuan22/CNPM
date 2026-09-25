import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { createTestAccount, deleteTestAccount } from '../../test/factories';
import { ACCOUNT_STATUS } from '../../common/constants/account-status';
import { getPrismaClient } from '../../config/prisma';
import { verifyPassword } from '../../common/utils/password';

const createdAccountIds: number[] = [];

afterAll(async () => {
  await Promise.all(createdAccountIds.map((id) => deleteTestAccount(id)));
});

const validRegisterPayload = () => {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  return {
    TenDangNhap: `newuser_${suffix}`,
    Email: `newuser_${suffix}@example.com`,
    MatKhau: 'Test@12345',
    HoTen: 'New User',
    SoDienThoai: '0912345678',
    NgaySinh: '1998-05-20',
    GioiTinh: 'Nam',
  };
};

describe('POST /api/auth/register', () => {
  it('registers a valid customer account', async () => {
    const payload = validRegisterPayload();
    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.account.TenDangNhap).toBe(payload.TenDangNhap);
    expect(res.body.data.accessToken).toBeTypeOf('string');
    expect(res.body.data.account).not.toHaveProperty('MatKhau');
    createdAccountIds.push(res.body.data.account.MaTaiKhoan);
  });

  it('stores the password as a bcrypt hash, never plaintext', async () => {
    const payload = validRegisterPayload();
    const res = await request(app).post('/api/auth/register').send(payload);
    createdAccountIds.push(res.body.data.account.MaTaiKhoan);

    const prisma = getPrismaClient();
    const row = await prisma.tAI_KHOAN.findUnique({
      where: { MaTaiKhoan: res.body.data.account.MaTaiKhoan },
    });
    expect(row?.MatKhau).not.toBe(payload.MatKhau);
    expect(row?.MatKhau.startsWith('$2')).toBe(true); // bcrypt hash prefix
    expect(await verifyPassword(payload.MatKhau, row!.MatKhau)).toBe(true);
  });

  it('rejects a duplicate TenDangNhap', async () => {
    const payload = validRegisterPayload();
    const first = await request(app).post('/api/auth/register').send(payload);
    createdAccountIds.push(first.body.data.account.MaTaiKhoan);

    const second = await request(app)
      .post('/api/auth/register')
      .send({ ...payload, Email: `other_${Date.now()}@example.com` });

    expect(second.status).toBe(409);
    expect(second.body.success).toBe(false);
  });

  it('rejects a duplicate Email', async () => {
    const payload = validRegisterPayload();
    const first = await request(app).post('/api/auth/register').send(payload);
    createdAccountIds.push(first.body.data.account.MaTaiKhoan);

    const second = await request(app)
      .post('/api/auth/register')
      .send({ ...payload, TenDangNhap: `other_${Date.now()}` });

    expect(second.status).toBe(409);
  });

  it('rejects invalid input with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ Email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('DDI-01 (resolved): registers successfully WITHOUT NgaySinh/GioiTinh — they are not required', async () => {
    const payload = validRegisterPayload();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { NgaySinh: _ngaySinh, GioiTinh: _gioiTinh, ...minimalPayload } = payload;

    const res = await request(app).post('/api/auth/register').send(minimalPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.account.NgaySinh).toBeNull();
    expect(res.body.data.account.GioiTinh).toBeNull();
    expect(res.body.data.account.AnhDaiDien).toBeNull();
    // SoDienThoai stays mandatory — confirms DDI-01 didn't loosen it too.
    expect(res.body.data.account.SoDienThoai).toBe(payload.SoDienThoai);
    createdAccountIds.push(res.body.data.account.MaTaiKhoan);
  });

  it('DDI-01 (resolved): still rejects registration missing the mandatory SoDienThoai', async () => {
    const payload = validRegisterPayload();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { SoDienThoai: _soDienThoai, ...payloadWithoutPhone } = payload;

    const res = await request(app).post('/api/auth/register').send(payloadWithoutPhone);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: account.Email, MatKhau: plainPassword });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTypeOf('string');
    expect(res.body.data.account.MaTaiKhoan).toBe(account.MaTaiKhoan);
    expect(res.headers['set-cookie']?.[0]).toContain('refresh_token=');
  });

  it('logs in with TenDangNhap as identifier too', async () => {
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: account.TenDangNhap, MatKhau: plainPassword });

    expect(res.status).toBe(200);
  });

  it('rejects wrong password', async () => {
    const { account } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: account.Email, MatKhau: 'WrongPassword123' });

    expect(res.status).toBe(401);
  });

  it('rejects an unknown account', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'nobody@example.com', MatKhau: 'whatever123' });

    expect(res.status).toBe(401);
  });

  it('rejects a locked account even with the correct password', async () => {
    const { account, plainPassword } = await createTestAccount({ status: ACCOUNT_STATUS.LOCKED });
    createdAccountIds.push(account.MaTaiKhoan);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: account.Email, MatKhau: plainPassword });

    expect(res.status).toBe(403);
  });
});

describe('Authenticated route protection', () => {
  it('rejects a protected endpoint with no token', async () => {
    const res = await request(app).get('/api/profile/me');
    expect(res.status).toBe(401);
  });

  it('rejects a protected endpoint with an invalid token', async () => {
    const res = await request(app).get('/api/profile/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('allows a protected endpoint with a valid token', async () => {
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: account.Email, MatKhau: plainPassword });
    const token = login.body.data.accessToken;

    const res = await request(app).get('/api/profile/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.MaTaiKhoan).toBe(account.MaTaiKhoan);
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the refresh token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']?.[0]).toContain('refresh_token=;');
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('always returns a generic success response (no account enumeration)', async () => {
    const known = await createTestAccount();
    createdAccountIds.push(known.account.MaTaiKhoan);

    const resKnown = await request(app)
      .post('/api/auth/forgot-password')
      .send({ Email: known.account.Email });
    const resUnknown = await request(app)
      .post('/api/auth/forgot-password')
      .send({ Email: 'definitely-not-registered@example.com' });

    expect(resKnown.status).toBe(200);
    expect(resUnknown.status).toBe(200);
    expect(resKnown.body.message).toBe(resUnknown.body.message);
  });
});
