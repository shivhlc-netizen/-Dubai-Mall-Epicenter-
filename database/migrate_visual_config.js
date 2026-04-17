const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
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

  console.log('Adding visual_config column to gallery_images...');
  try {
    await connection.execute('ALTER TABLE gallery_images ADD COLUMN visual_config JSON NULL');
    console.log('✓ Success');
  } catch (e) {
    console.log(e.message.includes('Duplicate column') ? '✓ Column already exists' : '✗ Error: ' + e.message);
  }

  await connection.end();
}

migrate().catch(console.error);
