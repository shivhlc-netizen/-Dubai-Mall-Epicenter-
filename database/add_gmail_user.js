const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function addEmailUser() {
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

  const name = 'Shiv HLC';
  const email = 'shiv.hlc@gmail.com';
  const password = 'S#iv2026';
  const hash = await bcrypt.hash(password, 12);

  await connection.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?',
    [name, email, hash, 'user', name]
  );

  console.log(`✓ User '${email}' created successfully with password 'S#iv2026'.`);
  await connection.end();
}

addEmailUser().catch(console.error);
