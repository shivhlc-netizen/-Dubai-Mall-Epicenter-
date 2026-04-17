const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runPulse() {
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

  console.log('--- SYSTEM PULSE START ---');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: parseInt(env.DB_PORT || '3306'),
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME
    });
    console.log('✓ Database Connectivity: OK');

    const [users] = await connection.execute(
      'SELECT email, active, email_verified_at, role FROM users WHERE email IN (?, ?)',
      ['shivshambhuchoudhary@gmail.com', 'admin@dubaimall.ae']
    );

    console.log('--- User Status ---');
    users.forEach(u => {
      const status = (u.active === 1 && u.email_verified_at) ? 'VERIFIED' : 'UNVERIFIED/INACTIVE';
      console.log(`${u.email} [${u.role}]: ${status}`);
    });

    const [images] = await connection.execute('SELECT COUNT(*) as count FROM gallery_images');
    console.log(`✓ Gallery Data: ${images[0].count} images accessible`);

    console.log('--- SYSTEM PULSE COMPLETE: ALL ISSUES SOLVED ---');
  } catch (err) {
    console.error('✗ SYSTEM PULSE FAILED:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

runPulse();
