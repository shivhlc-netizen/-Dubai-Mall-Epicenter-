const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function forceSeedShiv() {
  const envPath = path.join(__dirname, '../.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const [k, ...v] = line.split('=');
      if (k && !k.startsWith('#') && v.length) {
        env[k.trim()] = v.join('=').trim();
      }
    });
  }

  const connection = await mysql.createConnection({
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT || '3306', 10),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'dubai_mall'
  });

  const name = 'shiv';
  const email = 'shiv@dubaimall.ae';
  const password = 'S#iv2026';
  const hash = await bcrypt.hash(password, 12);

  // Force update the password hash and role
  await connection.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash=?, role=?',
    [name, email, hash, 'admin', hash, 'admin']
  );

  console.log(`✓ User '${name}' credentials and admin role FORCED/UPDATED successfully.`);
  await connection.end();
}

forceSeedShiv().catch(console.error);
