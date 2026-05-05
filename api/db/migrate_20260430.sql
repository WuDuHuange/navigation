-- 增量迁移脚本（对已有数据库执行）
-- 用法：psql $DATABASE_URL -f api/db/migrate_20260430.sql

-- 1. links 表添加 click_count 列
ALTER TABLE links ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- 2. 创建操作审计表
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER,
  admin_username VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id INTEGER,
  detail TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
