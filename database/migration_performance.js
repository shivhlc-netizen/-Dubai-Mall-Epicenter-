const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const envPath = path.join(__dirname, '../.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const k = parts[0].trim();
        let v = parts.slice(1).join('=').trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.substring(1, v.length - 1);
        env[k] = v;
      }
    });
  }

  const connection = await mysql.createConnection({
    host: env.DB_HOST || '127.0.0.1',
    port: parseInt(env.DB_PORT || '3306', 10),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || 'S#iv2301',
    database: env.DB_NAME || 'dubai_mall'
  });

  console.log('Connected to database. Applying Performance Optimization...');

  const runSafe = async (sql) => {
    try { await connection.execute(sql); } catch (e) { console.warn('Skipped:', e.message); }
  };

  try {
    // Indexing
    await runSafe(`CREATE INDEX idx_visits_path_date ON site_visits(path, created_at)`);
    await runSafe(`CREATE INDEX idx_visits_created ON site_visits(created_at)`);
    await runSafe(`CREATE INDEX idx_exp_status_date ON user_experiences(status, created_at)`);
    await runSafe(`CREATE INDEX idx_exp_featured ON user_experiences(is_featured_on_home)`);
    await runSafe(`CREATE INDEX idx_comm_exp_status ON experience_comments(experience_id, status)`);

    // Aggregation table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS aggregated_daily_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        path VARCHAR(255) NOT NULL,
        visit_count INT DEFAULT 0,
        UNIQUE KEY unique_day_path (date, path)
      ) ENGINE=InnoDB
    `);

    // Add columns for custom admin views (UX optimization)
    const [uCols] = await connection.execute('SHOW COLUMNS FROM users');
    const uColNames = uCols.map(c => c.Field);
    if (!uColNames.includes('department')) {
        await connection.execute('ALTER TABLE users ADD COLUMN department VARCHAR(100) NULL');
    }

    console.log('Database optimizations applied.');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await connection.end();
    console.log('Performance migration complete.');
  }
}

migrate().catch(console.error);
