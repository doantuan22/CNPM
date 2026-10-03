import { AuthRepository } from './auth.repository';
import { RolesRepository } from '../roles/roles.repository';
import { AppError } from '../../common/errors/app-error';
import { hashPassword, verifyPassword } from '../../common/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import {
  signPasswordResetToken,
  decodePasswordResetToken,
  matchesPasswordFingerprint,
} from '../../common/utils/password-reset-token';
import { toSafeAccount, SafeAccount } from '../../common/utils/account-mapper';
import { ROLE_NAMES } from '../../common/constants/roles';
import { ACCOUNT_STATUS } from '../../common/constants/account-status';
import { EmailService, NodemailerEmailService } from '../email/email.service';
import { env } from '../../config/env';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './auth.schemas';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  account: SafeAccount;
  tokens: AuthTokens;
}

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository = new AuthRepository(),
    private readonly rolesRepository: RolesRepository = new RolesRepository(),
    private readonly emailService: EmailService = new NodemailerEmailService()
  ) {}

  private async issueTokens(maTaiKhoan: number, role: string): Promise<AuthTokens> {
    const payload = { sub: String(maTaiKhoan), role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.authRepository.findByEmail(input.Email),
      this.authRepository.findByUsername(input.TenDangNhap),
    ]);
    if (existingEmail) throw AppError.conflict('Email đã được sử dụng');
    if (existingUsername) throw AppError.conflict('Tên đăng nhập đã được sử dụng');

    const customerRole = await this.rolesRepository.findByName(ROLE_NAMES.CUSTOMER);
    if (!customerRole) {
      // Role must be seeded by database/seed/001_roles.sql before auth can work.
      throw AppError.internal('Vai trò khách hàng chưa được khởi tạo trong hệ thống');
    }

    const matKhauHash = await hashPassword(input.MatKhau);
    const now = new Date();

    const account = await this.authRepository.create({
      TenDangNhap: input.TenDangNhap,
      Email: input.Email,
      MatKhau: matKhauHash,
      HoTen: input.HoTen,
      SoDienThoai: input.SoDienThoai,
      NgaySinh: input.NgaySinh ?? null,
      GioiTinh: input.GioiTinh ?? null,
      AnhDaiDien: null,
      TrangThai: ACCOUNT_STATUS.ACTIVE,
      NgayTao: now,
      NgayCapNhat: now,
      VAI_TRO: { connect: { MaVaiTro: customerRole.MaVaiTro } },
    });

    const tokens = await this.issueTokens(account.MaTaiKhoan, ROLE_NAMES.CUSTOMER);
    return { account: toSafeAccount(account), tokens };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const account = await this.authRepository.findByEmailOrUsername(input.identifier);
    if (!account) {
      // Keep the unknown-account path close to the same cost as a real bcrypt
      // comparison, reducing username/email enumeration through timing.
      await verifyPassword(input.MatKhau, '$2b$12$RDB7iar0FYW8YsEwBSPO.eUPLa/DjejjC6HiP53/P32lcFnkPoFkm');
      throw AppError.unauthorized('Email/tên đăng nhập hoặc mật khẩu không đúng');
    }

    // BUG-004: check the lock BEFORE the password. Doing it after made a locked
    // account answer 403 only to the correct password and 401 to a wrong one,
    // so anyone could use the status code as a password oracle. A locked
    // account now answers 403 regardless of the password, which is never checked.
    if (account.TrangThai === ACCOUNT_STATUS.LOCKED) {
      throw AppError.forbidden('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên');
    }

    const validPassword = await verifyPassword(input.MatKhau, account.MatKhau);
    if (!validPassword) {
      throw AppError.unauthorized('Email/tên đăng nhập hoặc mật khẩu không đúng');
    }

    const role = await this.rolesRepository.findById(account.MaVaiTro);
    const tokens = await this.issueTokens(account.MaTaiKhoan, role?.TenVaiTro ?? '');
    return { account: toSafeAccount(account), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const account = await this.authRepository.findById(Number(payload.sub));
    if (!account || account.TrangThai === ACCOUNT_STATUS.LOCKED) {
      throw AppError.unauthorized('Tài khoản không khả dụng');
    }

    const role = await this.rolesRepository.findById(account.MaVaiTro);
    if (!role) throw AppError.unauthorized('Vai trò tài khoản không hợp lệ');
    return this.issueTokens(account.MaTaiKhoan, role.TenVaiTro);
  }

  /** Always preserves the same observable result for known/unknown emails. */
  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const account = await this.authRepository.findByEmail(input.Email);
    if (!account) return;

    const token = signPasswordResetToken(account.MaTaiKhoan, account.MatKhau);
    const resetUrl = new URL('/reset-password', env.FRONTEND_URL);
    resetUrl.searchParams.set('token', token);

    try {
      await this.emailService.sendPasswordResetEmail({ to: account.Email, resetUrl: resetUrl.toString() });
    } catch {
      // Do not expose delivery errors: doing so only for a known account
      // would reintroduce account enumeration. Never log token/SMTP details.
      console.warn('Password reset email delivery failed');
    }
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    let decoded;
    try {
      decoded = decodePasswordResetToken(input.token);
    } catch {
      throw AppError.badRequest('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    const account = await this.authRepository.findById(decoded.maTaiKhoan);
    if (!account || !matchesPasswordFingerprint(decoded.fp, account.MatKhau)) {
      throw AppError.badRequest('Token đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng');
    }

    const newHash = await hashPassword(input.MatKhauMoi);
    await this.authRepository.updatePassword(account.MaTaiKhoan, newHash);
  }
}
