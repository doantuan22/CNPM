import { getPrismaClient } from '../../config/prisma';

export interface DatabaseStatus {
  connected: boolean;
  message: string;
}

export class HealthRepository {
  /**
   * Check database connectivity via Prisma 7 client without crashing if DB is offline.
   */
  async checkDatabase(): Promise<DatabaseStatus> {
    try {
      const prisma = getPrismaClient();
      // Test Prisma connectivity via $queryRaw or basic ping
      await prisma.$queryRaw`SELECT 1 as ping`;
      return { connected: true, message: 'Database connected successfully' };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Database connection not initialized',
      };
    }
  }
}
