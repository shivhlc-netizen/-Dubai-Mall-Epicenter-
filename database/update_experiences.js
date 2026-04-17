const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function updateSchema() {
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
    database: env.DB_NAME || 'dubai_mall',
    multipleStatements: true
  });

  console.log('Connected to MySQL');

  const sql = `
    CREATE TABLE IF NOT EXISTS user_experiences (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      user_id       INT NOT NULL,
      title         VARCHAR(200) NOT NULL,
      description   TEXT,
      experience_type VARCHAR(50) DEFAULT '7-star',
      image_url     VARCHAR(500),
      is_public     TINYINT(1) DEFAULT 1,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;

  await connection.query(sql);
  console.log('User experiences table created');

  await connection.end();
}

updateSchema().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
