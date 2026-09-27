import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Database
  DATABASE_URL: z
    .string()
    .default(
      'sqlserver://localhost:1433;database=HotelBooking;user=sa;password=YourPassword;encrypt=false;trustServerCertificate=true'
    ),

  // CORS & Frontend
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  TRUST_PROXY: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32).default('dev_jwt_access_secret_min_32_characters_key'),
  JWT_REFRESH_SECRET: z.string().min(32).default('dev_jwt_refresh_secret_min_32_characters_key'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  // VNPAY Sandbox (M6)
  VNPAY_TMN_CODE: z.string().optional().default(''),
  VNPAY_HASH_SECRET: z.string().optional().default(''),
  VNPAY_PAYMENT_URL: z.string().optional().default('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
  VNPAY_REFUND_URL: z.string().optional().default('https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'),
  // Mounted under app.use('/api', routes) (see app.ts) — NOT /api/v1.
  VNPAY_RETURN_URL: z.string().optional().default('http://localhost:5000/api/payments/vnpay-return'),
  VNPAY_IPN_URL: z.string().optional().default('http://localhost:5000/api/payments/vnpay-ipn'),

  // A DAT_PHONG left in "Chờ thanh toán" longer than this is treated as
  // abandoned and auto-cancelled the next time it is touched (M6 §2) — see
  // bookings/booking-expiry.ts.
  PAYMENT_TIMEOUT_MINUTES: z.coerce.number().positive().default(15),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV !== 'production') return;

  const requiredProductionSecrets: Array<[keyof typeof value, string]> = [
    ['DATABASE_URL', 'DATABASE_URL'],
    ['JWT_ACCESS_SECRET', 'JWT_ACCESS_SECRET'],
    ['JWT_REFRESH_SECRET', 'JWT_REFRESH_SECRET'],
    ['CLOUDINARY_API_SECRET', 'CLOUDINARY_API_SECRET'],
    ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_CLOUD_NAME'],
    ['CLOUDINARY_API_KEY', 'CLOUDINARY_API_KEY'],
    ['VNPAY_TMN_CODE', 'VNPAY_TMN_CODE'],
    ['VNPAY_HASH_SECRET', 'VNPAY_HASH_SECRET'],
  ];
  for (const [key, label] of requiredProductionSecrets) {
    const raw = String(value[key] ?? '');
    if (!raw || /change_me|your_|dev_jwt|yourpassword/i.test(raw)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `${label} must be configured for production` });
    }
  }
  if (!value.FRONTEND_URL.startsWith('https://')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['FRONTEND_URL'], message: 'FRONTEND_URL must use HTTPS in production' });
  }
  const publicUrls = [
    ['CORS_ORIGIN', value.CORS_ORIGIN],
    ['VNPAY_RETURN_URL', value.VNPAY_RETURN_URL],
    ['VNPAY_IPN_URL', value.VNPAY_IPN_URL],
  ] as const;
  for (const [key, raw] of publicUrls) {
    if (raw.split(',').some((url) => !url.trim().startsWith('https://'))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `${key} must use HTTPS in production` });
    }
  }
  if (value.VNPAY_PAYMENT_URL.includes('sandbox') || value.VNPAY_REFUND_URL.includes('sandbox')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['VNPAY_PAYMENT_URL'], message: 'Production must not use VNPAY sandbox endpoints' });
  }
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Environment configuration validation failed');
  }
  return result.data;
};

export const env = parseEnv();
export type Environment = z.infer<typeof envSchema>;
