import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { env } from '../../config/env';
import { createTestAccount, deleteTestAccount } from '../../test/factories';
import { ACCOUNT_STATUS } from '../../common/constants/account-status';
import { getPrismaClient } from '../../config/prisma';
import { signPasswordResetToken } from '../../common/utils/password-reset-token';
import { REFRESH_TOKEN_COOKIE_NAME } from '../../common/utils/jwt';

/**
 * BUG-012 — a password change/reset must kill the refresh tokens issued before it.
 * Refresh tokens carry a fingerprint of the password hash they were issued under.
 */
const createdAccountIds: number[] = [];
afterAll(async () => {
  await Promise.all(createdAccountIds.map((id) => deleteTestAccount(id)));
});

const NEW_PASSWORD = 'BrandNew@4567';
const JWT_OPTIONS = { algorithm: 'HS256', expiresIn: '7d', issuer: 'hotel-booking-api', audience: 'hotel-booking-web' } as const;

const newAccount = async () => {
  const created = await createTestAccount();
  createdAccountIds.push(created.account.MaTaiKhoan);
  return created;
};

const setCookies = (res: request.Response): string[] => (res.headers['set-cookie'] as unknown as string[] | undefined) ?? [];

/** The `refresh_token=<jwt>` pair, ready to send back as a Cookie header. */
const cookieFrom = (res: request.Response): string => {
  const raw = setCookies(res).find((c) => c.startsWith(`${REFRESH_TOKEN_COOKIE_NAME}=`));
  if (!raw) throw new Error('no refresh cookie in response');
  return raw.split(';')[0];
};
const tokenOf = (cookie: string) => cookie.slice(REFRESH_TOKEN_COOKIE_NAME.length + 1);

const login = async (identifier: string, MatKhau: string) => {
  const res = await request(app).post('/api/auth/login').send({ identifier, MatKhau });
  return { res, accessToken: res.body.data?.accessToken as string, cookie: res.status === 200 ? cookieFrom(res) : '' };
};
const refreshWith = (cookie: string) => request(app).post('/api/auth/refresh').set('Cookie', cookie);
const changePassword = (accessToken: string, MatKhauCu: string, MatKhauMoi = NEW_PASSWORD) =>
  request(app).post('/api/auth/change-password').set('Authorization', `Bearer ${accessToken}`).send({ MatKhauCu, MatKhauMoi });
const profileWith = (accessToken: string) => request(app).get('/api/profile/me').set('Authorization', `Bearer ${accessToken}`);

describe('BUG-012 refresh tokens after change-password', () => {
  it('refreshes before the change, and is refused afterwards without issuing a token', async () => {
    const { account, plainPassword } = await newAccount();
    const a = await login(account.Email, plainPassword);

    expect((await refreshWith(a.cookie)).status).toBe(200);

    expect((await changePassword(a.accessToken, plainPassword)).status).toBe(200);

    const stale = await refreshWith(a.cookie);
    expect(stale.status).toBe(401);
    expect(stale.body.success).toBe(false);
    expect(stale.body.data?.accessToken).toBeUndefined();
    expect(JSON.stringify(stale.body)).not.toContain('eyJ'); // no JWT anywhere in the response
  });

  it('clears the dead refresh cookie with the same scope it was set with', async () => {
    const { account, plainPassword } = await newAccount();
    const a = await login(account.Email, plainPassword);
    const original = setCookies(a.res)[0];
    await changePassword(a.accessToken, plainPassword);

    const cleared = setCookies(await refreshWith(a.cookie))[0];

    expect(cleared).toContain(`${REFRESH_TOKEN_COOKIE_NAME}=;`);
    expect(cleared).toContain('Expires=Thu, 01 Jan 1970');
    for (const attr of ['Path=/api/auth', 'HttpOnly', 'SameSite=Lax']) {
      expect(original).toContain(attr);
      expect(cleared).toContain(attr);
    }
  });

  it('keeps the caller signed in with a fresh pair and signs every other device out', async () => {
    const { account, plainPassword } = await newAccount();
    const a = await login(account.Email, plainPassword);
    const b = await login(account.Email, plainPassword);

    const changed = await changePassword(a.accessToken, plainPassword);
    expect(changed.status).toBe(200);
    const newAccess = changed.body.data.accessToken as string;
    const newCookie = cookieFrom(changed);

    // Session B (another device) is out.
    expect((await refreshWith(b.cookie)).status).toBe(401);
    // Session A carries on with the replacement cookie and access token.
    expect((await profileWith(newAccess)).status).toBe(200);
    const rotated = await refreshWith(newCookie);
    expect(rotated.status).toBe(200);
    // The cookie issued by that refresh keeps working too (rotation is unaffected).
    expect((await refreshWith(cookieFrom(rotated))).status).toBe(200);
    // And A's pre-change cookie is dead.
    expect((await refreshWith(a.cookie)).status).toBe(401);
  });

  it('does not leak the password, the hash, the fingerprint or the refresh token in the response', async () => {
    const { account, plainPassword } = await newAccount();
    const a = await login(account.Email, plainPassword);

    const changed = await changePassword(a.accessToken, plainPassword);
    const stored = await getPrismaClient().tAI_KHOAN.findUnique({ where: { MaTaiKhoan: account.MaTaiKhoan } });
    const body = JSON.stringify(changed.body);
    const refreshJwt = tokenOf(cookieFrom(changed));
    const fingerprint = (jwt.decode(refreshJwt) as { pwdv: string }).pwdv;

    expect(Object.keys(changed.body.data)).toEqual(['accessToken']);
    for (const secret of [plainPassword, NEW_PASSWORD, stored!.MatKhau, fingerprint, refreshJwt]) {
      expect(body).not.toContain(secret);
    }
  });

  it('still lets the OLD access token work until it expires (stateless access tokens, 15 min)', async () => {
    const { account, plainPassword } = await newAccount();
    const a = await login(account.Email, plainPassword);
    await changePassword(a.accessToken, plainPassword);

    // Known limitation: `authenticate` never reads the database, so only refresh tokens are revoked.
    expect((await profileWith(a.accessToken)).status).toBe(200);
  });

  it('issues nothing when the change is rejected, and the old refresh token still works', async () => {
    const { account, plainPassword } = await newAccount();
    const a = await login(account.Email, plainPassword);

    const rejected = await changePassword(a.accessToken, 'WrongPassword@1');

    expect(rejected.status).toBe(400);
    expect(rejected.headers['set-cookie']).toBeUndefined();
    expect((await refreshWith(a.cookie)).status).toBe(200);
  });
});

describe('BUG-012 refresh tokens after reset-password', () => {
  it('kills refresh tokens issued before the reset, and only the new password logs in', async () => {
    const { account, plainPassword } = await newAccount();
    const a = await login(account.Email, plainPassword);
    expect((await refreshWith(a.cookie)).status).toBe(200);

    expect((await request(app).post('/api/auth/forgot-password').send({ Email: account.Email })).status).toBe(200);
    const resetToken = signPasswordResetToken(account.MaTaiKhoan, account.MatKhau);
    const reset = await request(app).post('/api/auth/reset-password').send({ token: resetToken, MatKhauMoi: NEW_PASSWORD });

    expect(reset.status).toBe(200);
    expect(reset.headers['set-cookie']).toBeUndefined(); // reset does not log anyone in
    expect(reset.body.data).toBeUndefined();

    const stale = await refreshWith(a.cookie);
    expect(stale.status).toBe(401);
    expect(stale.body.data?.accessToken).toBeUndefined();

    expect((await login(account.Email, NEW_PASSWORD)).res.status).toBe(200);
    expect((await login(account.Email, plainPassword)).res.status).toBe(401);
  });

  it('keeps single-use semantics of the reset token itself', async () => {
    const { account } = await newAccount();
    const resetToken = signPasswordResetToken(account.MaTaiKhoan, account.MatKhau);

    expect((await request(app).post('/api/auth/reset-password').send({ token: resetToken, MatKhauMoi: NEW_PASSWORD })).status).toBe(200);
    expect((await request(app).post('/api/auth/reset-password').send({ token: resetToken, MatKhauMoi: 'Another@9876' })).status).toBe(400);
  });

  it('lets a fresh login after the reset refresh normally', async () => {
    const { account } = await newAccount();
    const resetToken = signPasswordResetToken(account.MaTaiKhoan, account.MatKhau);
    await request(app).post('/api/auth/reset-password').send({ token: resetToken, MatKhauMoi: NEW_PASSWORD });

    const fresh = await login(account.Email, NEW_PASSWORD);

    expect((await refreshWith(fresh.cookie)).status).toBe(200);
  });
});

describe('BUG-012 other refresh rules still hold', () => {
  it('refuses to refresh a locked account', async () => {
    const { account, plainPassword } = await newAccount();
    const a = await login(account.Email, plainPassword);
    await getPrismaClient().tAI_KHOAN.update({ where: { MaTaiKhoan: account.MaTaiKhoan }, data: { TrangThai: ACCOUNT_STATUS.LOCKED } });

    expect((await refreshWith(a.cookie)).status).toBe(401);
  });

  it('refuses a refresh token that predates the fingerprint claim', async () => {
    const { account } = await newAccount();
    const legacy = jwt.sign({ sub: String(account.MaTaiKhoan), role: 'Khách hàng', typ: 'refresh' }, env.JWT_REFRESH_SECRET, JWT_OPTIONS);

    expect((await refreshWith(`${REFRESH_TOKEN_COOKIE_NAME}=${legacy}`)).status).toBe(401);
  });

  it('refuses a validly signed refresh token carrying a fingerprint that does not match the account', async () => {
    const { account } = await newAccount();
    const forged = jwt.sign(
      { sub: String(account.MaTaiKhoan), role: 'Khách hàng', typ: 'refresh', pwdv: 'a'.repeat(32) },
      env.JWT_REFRESH_SECRET,
      JWT_OPTIONS,
    );

    expect((await refreshWith(`${REFRESH_TOKEN_COOKIE_NAME}=${forged}`)).status).toBe(401);
  });

  it('issues a working refresh token at registration', async () => {
    const suffix = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const reg = await request(app).post('/api/auth/register').send({
      TenDangNhap: `bug012_${suffix}`, Email: `bug012_${suffix}@example.com`, MatKhau: 'Test@12345',
      HoTen: 'Bug Twelve', SoDienThoai: '0912345678',
    });
    expect(reg.status).toBe(201);
    createdAccountIds.push(reg.body.data.account.MaTaiKhoan);

    expect((await refreshWith(cookieFrom(reg))).status).toBe(200);
  });
});
