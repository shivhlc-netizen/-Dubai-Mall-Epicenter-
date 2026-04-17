const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function init() {
  // Load .env
  const envPath = path.join(__dirname, '../.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const [k, ...v] = line.split('=');
      if (k && !k.startsWith('#') && v.length) {
        env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  }

  const config = {
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT || '3306', 10),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    multipleStatements: true
  };

  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection(config);
  console.log('✓ Connected');

  // 1. Run Schema
  console.log('Executing schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await connection.query(schema);
  console.log('✓ Schema executed');

  // 2. Migrate existing gallery_images table — add columns if missing
  console.log('Running gallery_images migrations...');
  const migrations = [
    "ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS story TEXT AFTER description",
    "ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS emotional_hook VARCHAR(300) AFTER story",
    "ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS shift_style VARCHAR(30) NOT NULL DEFAULT 'mosaic' AFTER emotional_hook",
    "ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS featured TINYINT(1) NOT NULL DEFAULT 0 AFTER shift_style",
  ];
  for (const sql of migrations) {
    try { await connection.query(sql); } catch (e) { /* column may already exist */ }
  }
  console.log('✓ Migrations done');

  await connection.end();
}

init().then(() => {
  console.log('Database initialization complete.');
}).catch(err => {
  console.error('✗ Initialization failed:', err.message);
  process.exit(1);
});
