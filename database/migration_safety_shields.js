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
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || 'S#iv2301',
    database: env.DB_NAME || 'dubai_mall'
  });

  console.log('Deploying Admin Safety Shields...');

  try {
    // 1. Snapshot table for Undo/Redo
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gallery_snapshots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        snapshot_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    // 2. Approval Gate for Interns
    const [columns] = await connection.execute('SHOW COLUMNS FROM gallery_images');
    const colNames = columns.map(c => c.Field);

    if (!colNames.includes('is_approved')) {
        await connection.execute('ALTER TABLE gallery_images ADD COLUMN is_approved TINYINT(1) DEFAULT 0');
        console.log('Approval Gate active: All new uploads require admin signature.');
    }

    // 3. Mark existing recovered assets as approved
    await connection.execute('UPDATE gallery_images SET is_approved = 1 WHERE active = 1');

  } catch (err) {
    console.error('Safety Shield Deployment Error:', err.message);
  } finally {
    await connection.end();
    console.log('Shields Synchronized.');
  }
}

migrate().catch(console.error);
