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
    CREATE TABLE IF NOT EXISTS retail_shops (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(200) NOT NULL,
      category      VARCHAR(100),
      needs_catered TEXT,
      website_url   VARCHAR(500),
      logo_path     VARCHAR(500),
      is_featured   TINYINT(1) DEFAULT 0,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    INSERT IGNORE INTO retail_shops (name, category, needs_catered, website_url, is_featured) VALUES
    ('Apple Store', 'Electronics', 'Premium tech, iPhones, MacBooks, creative professionals', 'https://www.apple.com/', 1),
    ('Zara', 'Fashion', 'Trendy fast fashion, affordable luxury, latest styles', 'https://www.zara.com/ae/', 1),
    ('Sephora', 'Beauty', 'High-end cosmetics, skincare, perfumes, makeup artists', 'https://www.sephora.ae/', 1),
    ('Nike', 'Sports', 'Athletic footwear, training gear, professional sports apparel', 'https://www.nike.com/ae/', 1),
    ('Kinokuniya', 'Books', 'World-class library, rare editions, Japanese stationery, manga', 'https://uae.kinokuniya.com/', 0),
    ('Hamleys', 'Toys', 'Experiential toy store, world-class gifts, family entertainment', 'https://www.hamleys.ae/', 0);
  `;

  await connection.query(sql);
  console.log('Retail shops table created and seeded');

  await connection.end();
}

updateSchema().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
