const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function debugAuth() {
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

  const [users] = await connection.execute(
    'SELECT email, password_hash, role, active FROM users WHERE email = "shiv.hlc@gmail.com"'
  );

  if (users.length === 0) {
    console.log("User not found in DB.");
    await connection.end();
    return;
  }

  const user = users[0];
  console.log("DEBUG INFO:");
  console.log("Email in DB:", user.email);
  console.log("Role in DB:", user.role);
  console.log("Active state:", user.active);

  const testPassword = 'S#iv2026';
  const isValid = await bcrypt.compare(testPassword, user.password_hash);
  
  console.log("Attempting compare with 'S#iv2026'...");
  console.log("Bcrypt Match Result:", isValid);

  await connection.end();
}

debugAuth().catch(console.error);
