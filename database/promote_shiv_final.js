const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function promoteShiv() {
  const envPath = path.join(__dirname, '../.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const k = parts[0].trim();
        let v = parts.slice(1).join('=').trim();
        // Remove quotes if present
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.substring(1, v.length - 1);
        }
        env[k] = v;
      }
    });
  }

  const connection = await mysql.createConnection({
    host: env.DB_HOST || '127.0.0.1',
    port: parseInt(env.DB_PORT || '3306', 10),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD,
    database: env.DB_NAME || 'dubai_mall'
  });

  const email = 'shivshambhuchoudhary@gmail.com';
  
  // Update role to 'admin'
  const [result] = await connection.execute(
    "UPDATE users SET role = 'admin' WHERE email = ?",
    [email]
  );

  if (result.affectedRows > 0) {
    console.log(`✅ User ${email} has been promoted to ADMIN.`);
  } else {
    console.log(`❌ User ${email} not found in database.`);
    // Let's list users to see who is there
    const [users] = await connection.execute("SELECT name, email, role FROM users");
    console.log('Current users:', users);
  }

  await connection.end();
}

promoteShiv().catch(console.error);
