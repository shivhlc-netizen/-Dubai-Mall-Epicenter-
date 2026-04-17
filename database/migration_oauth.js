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

  console.log('Connected to database. Updating users table for Google OAuth...');

  try {
    // Make password_hash nullable for OAuth users
    await connection.execute(`
      ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL
    `);
    console.log('Modified password_hash to be nullable.');

    // Add provider and image columns if they don't exist
    const [columns] = await connection.execute('SHOW COLUMNS FROM users');
    const colNames = columns.map(c => c.Field);

    if (!colNames.includes('image')) {
        await connection.execute('ALTER TABLE users ADD COLUMN image VARCHAR(500) NULL');
        console.log('Added image column to users.');
    }
    
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await connection.end();
    console.log('Migration complete.');
  }
}

migrate().catch(console.error);
