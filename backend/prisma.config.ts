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
      'sqlserver://server.invalid:1433;database=HotelBooking;user=placeholder;password=CHANGE_ME;encrypt=true',
  },
});
