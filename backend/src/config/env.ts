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

  // JWT
  JWT_ACCESS_SECRET: z.string().default('dev_jwt_access_secret_min_32_characters_key'),
  JWT_REFRESH_SECRET: z.string().default('dev_jwt_refresh_secret_min_32_characters_key'),

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
