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

  console.log('Connected to database. Running migrations...');

  try {
    const [columns] = await connection.execute('SHOW COLUMNS FROM users');
    const colNames = columns.map(c => c.Field);

    if (!colNames.includes('failed_attempts')) {
        await connection.execute('ALTER TABLE users ADD COLUMN failed_attempts INT DEFAULT 0');
        console.log('Added failed_attempts to users.');
    }
    if (!colNames.includes('lock_until')) {
        await connection.execute('ALTER TABLE users ADD COLUMN lock_until TIMESTAMP NULL');
        console.log('Added lock_until to users.');
    }
    if (!colNames.includes('admin_preferences')) {
        await connection.execute('ALTER TABLE users ADD COLUMN admin_preferences JSON NULL');
        console.log('Added admin_preferences to users.');
    }

    const [gColumns] = await connection.execute('SHOW COLUMNS FROM gallery_images');
    const gColNames = gColumns.map(c => c.Field);

    if (!gColNames.includes('fingerprint')) {
        await connection.execute('ALTER TABLE gallery_images ADD COLUMN fingerprint VARCHAR(64) NULL');
        await connection.execute('CREATE INDEX idx_fingerprint ON gallery_images(fingerprint)');
        console.log('Added fingerprint to gallery_images.');
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS site_visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45),
        user_agent TEXT,
        path VARCHAR(255),
        referrer TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log('Ensured site_visits table exists.');

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await connection.end();
    console.log('Migration complete.');
  }
}

migrate().catch(console.error);
