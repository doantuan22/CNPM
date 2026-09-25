import { HealthRepository } from './health.repository';
import { env } from '../../config/env';

export interface HealthCheckResult {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  environment: string;
  database: {
    status: 'connected' | 'disconnected';
    details: string;
  };
}

export class HealthService {
  constructor(private readonly healthRepository: HealthRepository = new HealthRepository()) {}

  async getHealthStatus(includeDb = false): Promise<HealthCheckResult> {
    let dbStatus = { connected: false, message: 'Database check skipped' };

    if (includeDb) {
      dbStatus = await this.healthRepository.checkDatabase();
    }

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: {
        status: dbStatus.connected ? 'connected' : 'disconnected',
        details: dbStatus.message,
      },
    };
  }
}
