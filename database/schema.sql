-- Dubai Mall — The Epicenter
-- Database Schema v1.0
-- Run: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS dubai_mall
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dubai_mall;

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('admin','user') NOT NULL DEFAULT 'user',
  active        TINYINT(1)    NOT NULL DEFAULT 1,
  is_premium    TINYINT(1)    NOT NULL DEFAULT 0,
  last_login    TIMESTAMP     NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB;

-- ── Gallery Categories ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Gallery Images ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_images (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  filename       VARCHAR(255) NOT NULL,
  path           VARCHAR(500) NOT NULL,
  title          VARCHAR(200),
  description    TEXT,
  alt_text       VARCHAR(300),
  story          TEXT,
  emotional_hook VARCHAR(300),
  shift_style    VARCHAR(30)  NOT NULL DEFAULT 'mosaic',
  featured       TINYINT(1)  NOT NULL DEFAULT 0,
  category_id    INT,
  sort_order     INT          NOT NULL DEFAULT 0,
  active         TINYINT(1)  NOT NULL DEFAULT 1,
  uploaded_by    INT          NULL,
  created_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id)  REFERENCES gallery_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by)  REFERENCES users(id)              ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_active   (active),
  INDEX idx_featured (featured),
  INDEX idx_order    (sort_order)
) ENGINE=InnoDB;

-- ── Gallery Story ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_story (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL DEFAULT 'The Dubai Mall Story',
  narrative   TEXT,
  updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Audit Log ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NULL,
  action     VARCHAR(100) NOT NULL,
  target     VARCHAR(200),
  ip_address VARCHAR(45),
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user   (user_id),
  INDEX idx_action (action)
) ENGINE=InnoDB;
