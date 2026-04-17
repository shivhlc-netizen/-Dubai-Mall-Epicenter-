const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function fixUsers() {
  const envPath = path.join(__dirname, '../.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const [k, ...v] = line.split('=');
      if (k && !k.startsWith('#') && v.length) {
        env[k.trim()] = v.join('=').trim().replace(/^"(.*)"$/, '$1');
      }
    });
  }

  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });

  const users = ['admin@dubaimall.ae', 'user5@dubaimall.ae', 'shiv@dubaimall.ae', 'shiv.hlc@gmail.com', 'shivshambhuchoudhary@gmail.com'];
  
  await connection.execute(
    'UPDATE users SET active = 1, email_verified_at = NOW() WHERE email IN (' + users.map(() => '?').join(',') + ')',
    users
  );

  console.log('✓ All 5 primary users have been force-verified.');
  await connection.end();
}

fixUsers().catch(console.error);
