#!/usr/bin/env node
/**
 * Dubai Mall — Database Seed Script
 * Usage: node database/seed.js
 * Requires .env to be present (copy from .env.example)
 */
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load .env manually (avoid dotenv dependency in seed)
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const [k, ...v] = line.split('=');
      if (k && !k.startsWith('#') && v.length) {
        process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
}

const GALLERY_DIR = path.join(__dirname, '../public/gallery');

const CATEGORIES = [
  { name: 'All',           slug: 'all',           sort_order: 0 },
  { name: 'Architecture',  slug: 'architecture',  sort_order: 1 },
  { name: 'Luxury',        slug: 'luxury',        sort_order: 2 },
  { name: 'Attractions',   slug: 'attractions',   sort_order: 3 },
  { name: 'Dining',        slug: 'dining',        sort_order: 4 },
  { name: 'Entertainment', slug: 'entertainment', sort_order: 5 },
  { name: 'Events',        slug: 'events',        sort_order: 6 },
  { name: 'Fashion',       slug: 'fashion',       sort_order: 7 },
  { name: 'General',       slug: 'general',       sort_order: 8 },
];

function detectCategory(filename) {
  const f = filename.toLowerCase();
  if (/aquarium|dino|ice.rink|watersport|kidz|vr.park/.test(f)) return 'attractions';
  if (/fountain|water.show|firework/.test(f))                    return 'entertainment';
  if (/fashion|avenue|louis|vuitton|jewel|brand|luxury|chanel/.test(f)) return 'luxury';
  if (/dining|restaurant|food|cafe|terrace/.test(f))            return 'dining';
  if (/event|concert|show|nyt|stage/.test(f))                   return 'events';
  if (/expansion|mall|cover|the.dubai|emaar|exterior/.test(f))  return 'architecture';
  if (/gemini|render|generated/.test(f))                        return 'general';
  return 'general';
}

function toTitle(filename) {
  return path.basename(filename, path.extname(filename))
    .replace(/[-_.]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'dubai_mall',
    multipleStatements: false,
  });

  console.log('\n✓ Connected to MySQL\n');

  // Seed categories
  const catMap = {};
  for (const cat of CATEGORIES) {
    await conn.execute(
      'INSERT IGNORE INTO gallery_categories (name, slug, sort_order) VALUES (?, ?, ?)',
      [cat.name, cat.slug, cat.sort_order]
    );
    const [rows] = await conn.execute('SELECT id FROM gallery_categories WHERE slug = ?', [cat.slug]);
    catMap[cat.slug] = rows[0].id;
  }
  console.log('✓ Categories seeded');

  // Admin user
  const adminEmail    = (process.env.ADMIN_EMAIL    || 'admin@dubaimall.ae').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD   || 'Admin@Dubai2025!';
  const adminHash     = await bcrypt.hash(adminPassword, 12);
  await conn.execute(
    'INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Super Admin', adminEmail, adminHash, 'admin']
  );
  console.log(`✓ Admin user: ${adminEmail}  /  password: ${adminPassword}`);

  // Sample regular user
  const userHash = await bcrypt.hash('User@Dubai2025!', 10);
  await conn.execute(
    'INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Gallery Manager', 'user5@dubaimall.ae', userHash, 'user']
  );
  console.log('✓ User5: user5@dubaimall.ae  /  password: User@Dubai2025!');

  // Gallery images
  if (!fs.existsSync(GALLERY_DIR)) {
    console.warn('⚠  public/gallery/ not found — skipping image seed');
    await conn.end();
    return;
  }

  const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|gif)$/i;
  const files = fs.readdirSync(GALLERY_DIR)
    .filter(f => IMAGE_EXTS.test(f))
    .sort();

  let order = 0;
  for (const file of files) {
    const catSlug = detectCategory(file);
    const catId   = catMap[catSlug] || catMap['general'];
    const title   = toTitle(file);
    await conn.execute(
      `INSERT IGNORE INTO gallery_images (filename, path, title, category_id, sort_order, active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [file, `/gallery/${file}`, title, catId, order++]
    );
  }
  console.log(`✓ ${files.length} images seeded`);

  await conn.end();
  console.log('\n🎉 Seed complete!\n');
}

seed().catch(err => {
  console.error('\n✗ Seed failed:', err.message);
  process.exit(1);
});
