import mysql from 'mysql2/promise';
import fs from 'fs';

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

function buildSslConfig() {
  if (process.env.DB_SSL !== 'true') return undefined;
  // Aiven provides a CA cert — load from file path or inline PEM string
  const ca = process.env.DB_SSL_CA_PATH
    ? fs.readFileSync(process.env.DB_SSL_CA_PATH)
    : process.env.DB_SSL_CA
      ? Buffer.from(process.env.DB_SSL_CA.replace(/\\n/g, '\n'))
      : undefined;
  return { rejectUnauthorized: true, ...(ca ? { ca } : {}) };
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dubai_mall',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: buildSslConfig(),
    timezone: '+00:00',
  });
}

const pool = global._mysqlPool ?? createPool();
if (process.env.NODE_ENV !== 'production') global._mysqlPool = pool;

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(sql, params);
  return result;
}

export default pool;
