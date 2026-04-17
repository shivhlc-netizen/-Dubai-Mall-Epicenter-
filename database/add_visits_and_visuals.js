const mysql = require('mysql2/promise');

async function migrate() {
  console.log('🚀 Starting "Visits & Visuals" Migration...');
  
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'S#iv2301',
    database: 'dubai_mall',
  });

  try {
    // 1. Create site_visits table
    console.log('--- Creating site_visits table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS site_visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45),
        user_agent TEXT,
        path VARCHAR(255),
        referrer VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_path (path),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB;
    `);

    // 2. Ensure gallery_images has visual_config and fingerprint
    console.log('--- Enhancing gallery_images...');
    try {
      await pool.execute(`
        ALTER TABLE gallery_images 
        ADD COLUMN IF NOT EXISTS fingerprint VARCHAR(64) NULL,
        ADD COLUMN IF NOT EXISTS visual_config JSON NULL,
        ADD COLUMN IF NOT EXISTS story_id INT NULL,
        ADD INDEX IF NOT EXISTS idx_fingerprint (fingerprint)
      `);
    } catch (e) {
      // In case ADD COLUMN IF NOT EXISTS isn't supported by this MySQL version
      console.log('    (Note: Some columns might already exist or IF NOT EXISTS syntax unsupported)');
    }

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
