const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const envPath = path.join(__dirname, '../.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const k = parts[0].trim();
        let v = parts.slice(1).join('=').trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.substring(1, v.length - 1);
        env[k] = v;
      }
    });
  }

  const connection = await mysql.createConnection({
    host: env.DB_HOST || '127.0.0.1',
    port: parseInt(env.DB_PORT || '3306', 10),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || 'S#iv2301',
    database: env.DB_NAME || 'dubai_mall'
  });

  console.log('Connected to database. Running migrations for user_experiences Scrapbook...');

  try {
    // Ensure table exists (though it should)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_experiences (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        user_id       INT NULL,
        user_name     VARCHAR(100) NULL,
        title         VARCHAR(200) NOT NULL,
        description   TEXT,
        experience_type VARCHAR(50) DEFAULT '7-star',
        image_url     VARCHAR(500),
        is_public     TINYINT(1) DEFAULT 1,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    const [columns] = await connection.execute('SHOW COLUMNS FROM user_experiences');
    const colNames = columns.map(c => c.Field);

    if (!colNames.includes('status')) {
        await connection.execute("ALTER TABLE user_experiences ADD COLUMN status ENUM('pending', 'published', 'rejected') DEFAULT 'pending'");
        console.log('Added status to user_experiences.');
    }
    if (!colNames.includes('is_featured_on_home')) {
        await connection.execute('ALTER TABLE user_experiences ADD COLUMN is_featured_on_home TINYINT(1) DEFAULT 0');
        console.log('Added is_featured_on_home to user_experiences.');
    }
    if (!colNames.includes('user_name')) {
        await connection.execute('ALTER TABLE user_experiences ADD COLUMN user_name VARCHAR(100) NULL');
        console.log('Added user_name to user_experiences.');
    }
    
    // Allow guest posts
    await connection.execute('ALTER TABLE user_experiences MODIFY COLUMN user_id INT NULL');
    console.log('Modified user_experiences table to allow guest posts.');

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await connection.end();
    console.log('Migration complete.');
  }
}

migrate().catch(console.error);
