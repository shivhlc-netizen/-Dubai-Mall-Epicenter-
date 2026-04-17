const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
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

  const name = 'Shiv HLC Admin';
  const email = 'shiv.hlc@gmail.com';
  const password = 'S#iv2026';
  const role = 'admin';
  const hash = await bcrypt.hash(password, 12);

  // Force update the password hash and role, and ensure active=1
  await connection.execute(
    'INSERT INTO users (name, email, password_hash, role, active) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, password_hash=?, role=?, active=?',
    [name, email, hash, role, 1, name, hash, role, 1]
  );

  console.log(`✓ User '${email}' created/updated as ADMIN successfully.`);
  await connection.end();
}

createAdminUser().catch(err => {
  console.error('Error creating admin user:', err);
  process.exit(1);
});
