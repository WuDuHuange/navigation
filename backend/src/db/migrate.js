require('dotenv').config()
const { pool } = require('./index')
const bcrypt = require('bcryptjs')

const migrate = async () => {
  const client = await pool.connect()
  
  try {
    console.log('🔄 开始数据库迁移...')

    // 创建 links 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        url VARCHAR(500) NOT NULL,
        icon VARCHAR(50),
        category VARCHAR(50) DEFAULT '默认',
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ links 表创建成功')

    // 创建 articles 表
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
    await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`)
    
    // 添加 ai_summary 列（如果不存在）
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'ai_summary') THEN
          ALTER TABLE articles ADD COLUMN ai_summary TEXT;
        END IF;
      END $$;
    `)
    console.log('✅ articles 表创建成功')

    // 创建 comments 表
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
    await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id)`)
    console.log('✅ comments 表创建成功')

    // 创建 admins 表
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `)
    console.log('✅ admins 表创建成功')

    // 创建 settings 表（系统配置）
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ settings 表创建成功')

    // 插入初始数据：导航链接
    const linkExists = await client.query(`SELECT id FROM links WHERE title = '每日一签' LIMIT 1`)
    if (linkExists.rows.length === 0) {
      await client.query(`
        INSERT INTO links (title, description, url, icon, category, sort_order)
        VALUES ('每日一签', '灵梦御神签 - 每日运势占卜', 'https://reimu-fortune-qqfo.vercel.app/', '🎋', '工具', 1)
      `)
      console.log('✅ 初始导航链接已添加')
    }

    // 创建管理员账号
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    const adminExists = await client.query(`SELECT id FROM admins WHERE username = $1 LIMIT 1`, [adminUsername])
    if (adminExists.rows.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10)
      await client.query(`INSERT INTO admins (username, password_hash) VALUES ($1, $2)`, [adminUsername, passwordHash])
      console.log(`✅ 管理员账号已创建: ${adminUsername}`)
    }

    // 初始化 Gemini API Key 设置（如果环境变量中有）
    if (process.env.GEMINI_API_KEY) {
      await client.query(`
        INSERT INTO settings (key, value) VALUES ('gemini_api_key', $1)
        ON CONFLICT (key) DO NOTHING
      `, [process.env.GEMINI_API_KEY])
      console.log('✅ Gemini API Key 已配置')
    }

    console.log('🎉 数据库迁移完成！')
  } catch (err) {
    console.error('❌ 迁移失败:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
