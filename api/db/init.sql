-- 导航链接表
CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  category VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  summary TEXT,
  ai_summary TEXT,
  tags TEXT[],
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  nickname VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  content TEXT NOT NULL,
  ip_address VARCHAR(45),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 设置表
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 操作审计表
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

-- 创建默认管理员账户 (用户名: admin, 密码: admin123)
-- 密码使用 bcrypt 加密
INSERT INTO admins (username, password_hash) 
VALUES ('admin', '$2b$10$rQZ8K.XhPgqvQB8zLpYGXOYzPZ8vMKHgQPvqzJXqH7xVnqKkC.Kq6')
ON CONFLICT (username) DO NOTHING;

-- 添加示例导航链接
INSERT INTO links (title, url, description, icon, category, sort_order) VALUES
('GitHub', 'https://github.com', '全球最大的代码托管平台', 'github', '开发工具', 1),
('Google', 'https://google.com', '全球最大的搜索引擎', 'search', '搜索引擎', 2),
('MDN Web Docs', 'https://developer.mozilla.org', 'Web 技术权威文档', 'book', '文档', 3)
ON CONFLICT DO NOTHING;
