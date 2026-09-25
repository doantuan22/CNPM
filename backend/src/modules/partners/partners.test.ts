import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { createTestAccount, deleteTestAccount } from '../../test/factories';

const createdAccountIds: number[] = [];
afterAll(async () => {
  await Promise.all(createdAccountIds.map((id) => deleteTestAccount(id)));
});

const loginAndGetToken = async (email: string, password: string) => {
  const res = await request(app).post('/api/auth/login').send({ identifier: email, MatKhau: password });
  return res.body.data.accessToken as string;
};

const validApplication = () => ({
  SoCCCD: '079099001234',
  SoGiayPhepKinhDoanh: `GP-${Date.now()}`,
  MaSoThue: `MST-${Date.now()}`,
  TepGiayTo: 'https://example.com/documents/business-license.pdf',
});

describe('POST /api/partners/apply', () => {
  it('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/api/partners/apply').send(validApplication());
    expect(res.status).toBe(401);
  });

  it('lets an authenticated customer submit a partner application', async () => {
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);
    const token = await loginAndGetToken(account.Email, plainPassword);

    const res = await request(app)
      .post('/api/partners/apply')
      .set('Authorization', `Bearer ${token}`)
      .send(validApplication());

    expect(res.status).toBe(201);
    expect(res.body.data.TrangThaiDuyet).toBe('Chờ duyệt');
    expect(res.body.data.MaTaiKhoan).toBe(account.MaTaiKhoan);
  });

  it('rejects a second application while one is still pending', async () => {
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);
    const token = await loginAndGetToken(account.Email, plainPassword);

    await request(app).post('/api/partners/apply').set('Authorization', `Bearer ${token}`).send(validApplication());
    const second = await request(app)
      .post('/api/partners/apply')
      .set('Authorization', `Bearer ${token}`)
      .send(validApplication());

    expect(second.status).toBe(409);
  });
});

describe('GET /api/partners/me', () => {
  it("returns the caller's latest application status", async () => {
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);
    const token = await loginAndGetToken(account.Email, plainPassword);

    await request(app).post('/api/partners/apply').set('Authorization', `Bearer ${token}`).send(validApplication());
    const res = await request(app).get('/api/partners/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.TrangThaiDuyet).toBe('Chờ duyệt');
  });

  it('returns null when no application has been submitted yet', async () => {
    const { account, plainPassword } = await createTestAccount();
    createdAccountIds.push(account.MaTaiKhoan);
    const token = await loginAndGetToken(account.Email, plainPassword);

    const res = await request(app).get('/api/partners/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});
