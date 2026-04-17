// Migration: AI usage tracking tables
const mysql = require('mysql2/promise');
const fs = require('fs');

const env = fs.readFileSync('../.env', 'utf8').split('\n').reduce((a, l) => {
  const [k, ...v] = l.split('=');
  if (k && !l.startsWith('#')) a[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '');
  return a;
}, {});

async function migrate() {
  const conn = await mysql.createConnection({
    host: env.DB_HOST || '127.0.0.1',
    port: parseInt(env.DB_PORT || '3306'),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'dubai_mall',
  });

  // Per-call log
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS ai_usage_log (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      provider      ENUM('gemini') NOT NULL,
      input_tokens  INT NOT NULL DEFAULT 0,
      output_tokens INT NOT NULL DEFAULT 0,
      total_tokens  INT NOT NULL DEFAULT 0,
      success       TINYINT(1) NOT NULL DEFAULT 1,
      error_type    VARCHAR(100) DEFAULT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_provider_time (provider, created_at)
    )
  `);

  // Hourly aggregates — retained for 7 days then rolled up
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS ai_usage_hourly (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      provider       ENUM('gemini') NOT NULL,
      hour_start     DATETIME NOT NULL,
      calls_success  INT NOT NULL DEFAULT 0,
      calls_failed   INT NOT NULL DEFAULT 0,
      total_tokens   INT NOT NULL DEFAULT 0,
      updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_provider_hour (provider, hour_start)
    )
  `);

  // Weekly summaries — permanent archive after 7-day rollup
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS ai_usage_summary (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      provider          ENUM('gemini') NOT NULL,
      period_start      DATE NOT NULL,
      period_end        DATE NOT NULL,
      total_calls       INT NOT NULL DEFAULT 0,
      calls_success     INT NOT NULL DEFAULT 0,
      calls_failed      INT NOT NULL DEFAULT 0,
      total_tokens      INT NOT NULL DEFAULT 0,
      peak_hour         DATETIME DEFAULT NULL,
      peak_hour_tokens  INT NOT NULL DEFAULT 0,
      created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_provider_period (provider, period_start)
    )
  `);

  console.log('✅ ai_usage_log, ai_usage_hourly, ai_usage_summary tables ready');
  await conn.end();
}

migrate().catch(console.error);
