import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      'sqlserver://localhost:1433;database=HotelBooking;user=sa;password=YourPassword;encrypt=false;trustServerCertificate=true',
  },
});
