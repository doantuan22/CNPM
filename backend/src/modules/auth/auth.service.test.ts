import jwt from 'jsonwebtoken';
import { describe, expect, it, vi } from 'vitest';
import { env } from '../../config/env';
import { hashPassword, verifyPassword } from '../../common/utils/password';
import { signPasswordResetToken } from '../../common/utils/password-reset-token';
import { AuthRepository } from './auth.repository';
import { RolesRepository } from '../roles/roles.repository';
import { AuthService } from './auth.service';
import { FakeEmailService } from '../email/email.service';

const makeAccount = async () => ({
  MaTaiKhoan: 42,
  Email: 'customer@example.com',
  MatKhau: await hashPassword('OldPassword@123'),
});

const makeService = (account: Awaited<ReturnType<typeof makeAccount>>, emailService: FakeEmailService) => {
  const repository = {
    findByEmail: vi.fn().mockResolvedValue(account),
    findById: vi.fn().mockResolvedValue(account),
    updatePassword: vi.fn().mockImplementation(async (_id: number, passwordHash: string) => {
      account.MatKhau = passwordHash;
    }),
  } as unknown as AuthRepository;

  return { service: new AuthService(repository, {} as RolesRepository, emailService), repository };
};

describe('AuthService password reset delivery', () => {
  it('sends a reset email only for an existing account', async () => {
    const account = await makeAccount();
    const emailService = new FakeEmailService();
    const { service } = makeService(account, emailService);

    await service.forgotPassword({ Email: account.Email });

    expect(emailService.messages).toHaveLength(1);
    expect(emailService.messages[0].to).toBe(account.Email);
    const resetUrl = new URL(emailService.messages[0].resetUrl);
    expect(resetUrl.pathname).toBe('/reset-password');
    expect(resetUrl.searchParams.get('token')).toBeTruthy();
  });

  it('does not send an email for an unknown address', async () => {
    const emailService = new FakeEmailService();
    const repository = { findByEmail: vi.fn().mockResolvedValue(null) } as unknown as AuthRepository;
    const service = new AuthService(repository, {} as RolesRepository, emailService);

    await service.forgotPassword({ Email: 'unknown@example.com' });

    expect(emailService.messages).toHaveLength(0);
  });

  it('contains an SMTP delivery failure without leaking its details', async () => {
    const account = await makeAccount();
    const emailService = new FakeEmailService(new Error('SMTP credentials rejected'));
    const { service } = makeService(account, emailService);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(service.forgotPassword({ Email: account.Email })).resolves.toBeUndefined();
    expect(warning).toHaveBeenCalledWith('Password reset email delivery failed');
    warning.mockRestore();
  });
});

describe('AuthService resetPassword', () => {
  it('changes the password and invalidates the used token', async () => {
    const account = await makeAccount();
    const { service, repository } = makeService(account, new FakeEmailService());
    const token = signPasswordResetToken(account.MaTaiKhoan, account.MatKhau);

    await service.resetPassword({ token, MatKhauMoi: 'NewPassword@123' });

    expect(repository.updatePassword).toHaveBeenCalledOnce();
    expect(await verifyPassword('OldPassword@123', account.MatKhau)).toBe(false);
    expect(await verifyPassword('NewPassword@123', account.MatKhau)).toBe(true);
    await expect(service.resetPassword({ token, MatKhauMoi: 'AnotherPassword@123' })).rejects.toThrow(
      'Token đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng'
    );
  });

  it('rejects malformed and expired tokens', async () => {
    const account = await makeAccount();
    const { service } = makeService(account, new FakeEmailService());
    const expiredToken = jwt.sign(
      { sub: String(account.MaTaiKhoan), typ: 'pwd_reset', fp: 'a'.repeat(32) },
      env.JWT_ACCESS_SECRET,
      {
        expiresIn: -1,
        algorithm: 'HS256',
        issuer: 'hotel-booking-api',
        audience: 'hotel-booking-password-reset',
      }
    );

    await expect(service.resetPassword({ token: 'not-a-token', MatKhauMoi: 'NewPassword@123' })).rejects.toThrow(
      'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'
    );
    await expect(service.resetPassword({ token: expiredToken, MatKhauMoi: 'NewPassword@123' })).rejects.toThrow(
      'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'
    );
  });
});
