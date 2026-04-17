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

  console.log('Connected to database. Creating comments table...');

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS experience_comments (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        experience_id INT NOT NULL,
        user_id       INT NULL,
        user_name     VARCHAR(100) NULL,
        comment       TEXT NOT NULL,
        status        ENUM('pending', 'published', 'rejected') DEFAULT 'published',
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES user_experiences(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('Created experience_comments table.');

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await connection.end();
    console.log('Migration complete.');
  }
}

migrate().catch(console.error);
