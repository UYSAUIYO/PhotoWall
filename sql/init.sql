-- PhotoWall 数据库初始化脚本
-- 使用方式: mysql -u root -p < sql/init.sql

CREATE DATABASE IF NOT EXISTS photowall
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE photowall;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('visitor', 'user', 'admin') DEFAULT 'visitor',
  avatar VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 照片表
CREATE TABLE IF NOT EXISTS photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  title VARCHAR(200) DEFAULT '',
  description TEXT DEFAULT NULL,
  category VARCHAR(50) DEFAULT '其他',
  tags VARCHAR(500) DEFAULT '',
  visibility ENUM('public', 'private') DEFAULT 'public',
  width INT DEFAULT 0,
  height INT DEFAULT 0,
  file_size INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_category (category),
  INDEX idx_visibility (visibility),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- 系统设置表
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT DEFAULT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 默认设置
INSERT INTO settings (`key`, `value`) VALUES
  ('site_name', 'PhotoWall'),
  ('site_description', '我的照片墙'),
  ('allow_registration', 'true'),
  ('max_upload_size', '10485760')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- 默认管理员 (密码 admin123)
INSERT INTO users (username, email, password_hash, role) VALUES
  ('admin', 'admin@photowall.local', '$2b$10$ZqB6W6DvFGSHALcpUUBivexknif510RrAq3j.mK0gbQGmO2gIvh1e', 'admin')
ON DUPLICATE KEY UPDATE username=username;
