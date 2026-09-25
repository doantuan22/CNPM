import sql from 'mssql';
import { env } from './env';

const config: sql.config = {
  server: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE || 'HotelBooking',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

/**
 * Lazily creates (and caches) the SQL Server connection pool.
 * The app can start without database credentials; the connection is only
 * attempted when an endpoint actually calls getPool().
 */
export const getPool = (): Promise<sql.ConnectionPool> => {
  if (!poolPromise) {
    if (!process.env.DB_SERVER && !env.DATABASE_URL) {
      return Promise.reject(
        new Error('Database is not configured. Set DATABASE_URL or DB_SERVER in .env')
      );
    }
    const pool = new sql.ConnectionPool(config);
    poolPromise = pool.connect().catch((err: unknown) => {
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
};

export const closePool = async (): Promise<void> => {
  if (poolPromise) {
    const pool = await poolPromise;
    poolPromise = null;
    await pool.close();
  }
};

export { sql };
