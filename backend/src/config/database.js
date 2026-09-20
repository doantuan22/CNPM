const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise = null;

/**
 * Lazily creates (and caches) the SQL Server connection pool.
 * The app can start without database credentials; the connection is only
 * attempted when an endpoint actually calls getPool().
 */
const getPool = () => {
  if (!poolPromise) {
    if (!config.server || !config.database) {
      return Promise.reject(
        new Error('Database is not configured. Set DB_SERVER and DB_DATABASE in .env'),
      );
    }
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .catch((err) => {
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};

const closePool = async () => {
  if (poolPromise) {
    const pool = await poolPromise;
    poolPromise = null;
    await pool.close();
  }
};

module.exports = { sql, getPool, closePool };
