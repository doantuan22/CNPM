import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { createTestAccount, deleteTestAccount } from '../../test/factories';
import { ACCOUNT_STATUS } from '../../common/constants/account-status';

const createdAccountIds: number[] = [];
afterAll(async () => {
  await Promise.all(createdAccountIds.map((id) => deleteTestAccount(id)));
});

const loginAndGetToken = async (email: string, password: string) => {
  const res = await request(app).post('/api/auth/login').send({ identifier: email, MatKhau: password });
  return res.body.data.accessToken as string;
};

describe('GET /api/profile/me', () => {
  it("returns the caller's own profile", async () => {
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);
    const token = await loginAndGetToken(account.Email, plainPassword);

    const res = await request(app).get('/api/profile/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.MaTaiKhoan).toBe(account.MaTaiKhoan);
    expect(res.body.data).not.toHaveProperty('MatKhau');
  });

  it('DDI-01 (resolved): GET /me works when NgaySinh/GioiTinh/AnhDaiDien are NULL end-to-end', async () => {
    const suffix = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const reg = await request(app).post('/api/auth/register').send({
      TenDangNhap: `nullprofile_${suffix}`,
      Email: `nullprofile_${suffix}@example.com`,
      MatKhau: 'Test@12345',
      HoTen: 'Null Profile Fields',
      SoDienThoai: '0900000099',
      // NgaySinh/GioiTinh intentionally omitted
    });
    expect(reg.status).toBe(201);
    createdAccountIds.push(reg.body.data.account.MaTaiKhoan);

    const res = await request(app)
      .get('/api/profile/me')
      .set('Authorization', `Bearer ${reg.body.data.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.NgaySinh).toBeNull();
    expect(res.body.data.GioiTinh).toBeNull();
    expect(res.body.data.AnhDaiDien).toBeNull();
  });
});

describe('PATCH /api/profile/me', () => {
  it('updates whitelisted profile fields', async () => {
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);
    const token = await loginAndGetToken(account.Email, plainPassword);

    const res = await request(app)
      .patch('/api/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ HoTen: 'Updated Name', SoDienThoai: '0987654321', NgaySinh: '1990-01-01', GioiTinh: 'Nữ' });

    expect(res.status).toBe(200);
    expect(res.body.data.HoTen).toBe('Updated Name');
    expect(res.body.data.SoDienThoai).toBe('0987654321');
  });

  it('cannot change role or account status through the profile endpoint (mass-assignment guard)', async () => {
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);
    const token = await loginAndGetToken(account.Email, plainPassword);

    const res = await request(app)
      .patch('/api/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        HoTen: 'Still Me',
        MaVaiTro: 999,
        TrangThai: ACCOUNT_STATUS.LOCKED,
        NgayTao: '2000-01-01',
      });

    // Zod strips unknown/non-whitelisted keys by default, so the request
    // succeeds but the forbidden fields are silently ignored, not applied.
    expect(res.status).toBe(200);
    expect(res.body.data.MaVaiTro).toBe(account.MaVaiTro);
    expect(res.body.data.TrangThai).toBe(account.TrangThai);

    const stillWorks = await loginAndGetToken(account.Email, plainPassword);
    expect(stillWorks).toBeTypeOf('string');
  });

  it('rejects an unauthenticated update', async () => {
    const res = await request(app).patch('/api/profile/me').send({ HoTen: 'Nobody' });
    expect(res.status).toBe(401);
  });

  it('DDI-01 (resolved): PATCH /me can fill in NgaySinh/GioiTinh later for an account that registered without them', async () => {
    const suffix = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const reg = await request(app).post('/api/auth/register').send({
      TenDangNhap: `fillinlater_${suffix}`,
      Email: `fillinlater_${suffix}@example.com`,
      MatKhau: 'Test@12345',
      HoTen: 'Fill In Later',
      SoDienThoai: '0900000098',
    });
    expect(reg.status).toBe(201);
    createdAccountIds.push(reg.body.data.account.MaTaiKhoan);

    const res = await request(app)
      .patch('/api/profile/me')
      .set('Authorization', `Bearer ${reg.body.data.accessToken}`)
      .send({ HoTen: 'Fill In Later', SoDienThoai: '0900000098', NgaySinh: '1992-08-08', GioiTinh: 'Khác' });

    expect(res.status).toBe(200);
    expect(res.body.data.NgaySinh).toContain('1992-08-08');
    expect(res.body.data.GioiTinh).toBe('Khác');
  });
});
