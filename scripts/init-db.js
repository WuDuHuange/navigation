/**
 * 数据库初始化脚本
 * 运行方式：DATABASE_URL=你的数据库连接字符串 node scripts/init-db.js
 */
require('dotenv').config()
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function initDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 开始初始化数据库...')

    // 创建表
    await client.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        url VARCHAR(500) NOT NULL,
        icon VARCHAR(50) DEFAULT '🔗',
        category VARCHAR(50) DEFAULT '默认',
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE,
        content TEXT NOT NULL,
        summary VARCHAR(500),
        ai_summary TEXT,
        tags VARCHAR(50)[] DEFAULT '{}',
        published BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        nickname VARCHAR(50) NOT NULL,
        email VARCHAR(100),
        content TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT false,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id)`)

    console.log('✅ 数据表创建成功')

    // 插入默认导航链接
    const linkExists = await client.query(`SELECT id FROM links WHERE title = '每日一签' LIMIT 1`)
    if (linkExists.rows.length === 0) {
      await client.query(`
        INSERT INTO links (title, description, url, icon, category, sort_order)
        VALUES ('每日一签', '每日运势占卜', 'https://reimu-fortune-qqfo.vercel.app/', '🎋', '工具', 1)
      `)
      console.log('✅ 默认导航链接已添加')
    }

    // 创建默认管理员
    const adminExists = await client.query(`SELECT id FROM admins WHERE username = 'admin' LIMIT 1`)
    if (adminExists.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10)
      await client.query(`INSERT INTO admins (username, password_hash) VALUES ('admin', $1)`, [hash])
      console.log('✅ 默认管理员已创建 (admin / admin123)')
    }

    console.log('🎉 数据库初始化完成！')
    
  } catch (err) {
    console.error('❌ 初始化失败:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

initDatabase()
