const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Simple script to run migration without needing full project environment
async function migrate() {
  console.log('🚀 Starting "Manager & Storytelling" Migration...');
  
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'S#iv2301',
    database: 'dubai_mall',
    waitForConnections: true,
    connectionLimit: 1,
  });

  try {
    // 1. Add Manager Role to ENUM
    console.log('--- Updating user roles...');
    await pool.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user'
    `);

    // 2. Add Fingerprint to Gallery Images to prevent duplicates
    console.log('--- Adding fingerprint and storytelling fields to gallery_images...');
    try {
      await pool.execute(`
        ALTER TABLE gallery_images 
        ADD COLUMN fingerprint VARCHAR(64) NULL,
        ADD COLUMN story_id INT NULL,
        ADD COLUMN visual_config JSON NULL,
        ADD INDEX idx_fingerprint (fingerprint)
      `);
    } catch (e) {
      console.log('    (Columns might already exist)');
    }

    // 3. Ensure Gallery Story can handle continuous updates
    console.log('--- Enhancing gallery_story for continuous history...');
    await pool.execute(`
      ALTER TABLE gallery_story 
      ADD COLUMN subtitle VARCHAR(200) NULL,
      ADD COLUMN start_date DATE NULL,
      ADD COLUMN end_date DATE NULL,
      ADD COLUMN is_active TINYINT(1) DEFAULT 1
    `);

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
