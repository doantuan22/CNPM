import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../../config/env';
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from '../../common/utils/password-reset-token';

export interface PasswordResetEmail {
  to: string;
  resetUrl: string;
}

/** Small boundary that keeps SMTP concerns out of AuthService. */
export interface EmailService {
  sendPasswordResetEmail(message: PasswordResetEmail): Promise<void>;
}

const isSmtpConfigured = () =>
  // Automated tests must never depend on or send to a configured SMTP server.
  env.NODE_ENV !== 'test' && Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM);

const passwordResetText = ({ resetUrl }: PasswordResetEmail) => `Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Hotel Booking.

Mở liên kết sau để đặt lại mật khẩu (có hiệu lực trong ${PASSWORD_RESET_TOKEN_TTL_MINUTES} phút):
${resetUrl}

Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.`;

const passwordResetHtml = ({ resetUrl }: PasswordResetEmail) => `<!doctype html>
<html lang="vi">
  <body style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
    <h2>Đặt lại mật khẩu</h2>
    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Hotel Booking của bạn.</p>
    <p><a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Đặt lại mật khẩu</a></p>
    <p>Liên kết có hiệu lực trong ${PASSWORD_RESET_TOKEN_TTL_MINUTES} phút.</p>
    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
  </body>
</html>`;

/** SMTP implementation used by the running application. */
export class NodemailerEmailService implements EmailService {
  private readonly transporter: Transporter | null;

  constructor(transporter?: Transporter) {
    this.transporter = transporter ?? (isSmtpConfigured()
      ? nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
        })
      : null);
  }

  async sendPasswordResetEmail(message: PasswordResetEmail): Promise<void> {
    // Keeping SMTP optional locally lets contributors run the rest of the API
    // before configuring mail. Production startup rejects this configuration.
    if (!this.transporter) return;

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: message.to,
      subject: 'Đặt lại mật khẩu Hotel Booking',
      text: passwordResetText(message),
      html: passwordResetHtml(message),
    });
  }
}

/** In-memory delivery implementation for unit tests; it never uses a network. */
export class FakeEmailService implements EmailService {
  readonly messages: PasswordResetEmail[] = [];

  constructor(private readonly failure?: Error) {}

  async sendPasswordResetEmail(message: PasswordResetEmail): Promise<void> {
    if (this.failure) throw this.failure;
    this.messages.push(message);
  }
}
