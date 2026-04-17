const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function checkColumns() {
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

  const [columns] = await connection.execute('SHOW COLUMNS FROM users');
  console.log('Columns in users table:');
  columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));

  await connection.end();
}

checkColumns().catch(console.error);
