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

  // VNPAY Sandbox (Phase 2)
  VNPAY_TMN_CODE: z.string().optional().default(''),
  VNPAY_HASH_SECRET: z.string().optional().default(''),
  VNPAY_PAYMENT_URL: z.string().optional().default('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
  VNPAY_RETURN_URL: z.string().optional().default('http://localhost:5000/api/v1/payment/vnpay-return'),
  VNPAY_IPN_URL: z.string().optional().default('http://localhost:5000/api/v1/payment/vnpay-ipn'),
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
