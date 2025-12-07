const { Pool } = require('pg')

// 获取数据库连接字符串
let connectionString = process.env.DATABASE_URL

// 检查连接字符串是否存在
if (!connectionString) {
  console.error('警告: DATABASE_URL 环境变量未设置!')
}

// 移除 channel_binding 参数（pg 库不支持此参数）
if (connectionString) {
  connectionString = connectionString.replace(/[&?]channel_binding=[^&]*/g, '')
}

const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: connectionString ? { rejectUnauthorized: false } : undefined
})

// 连接错误处理
pool.on('error', (err) => {
  console.error('数据库连接池错误:', err.message)
})

module.exports = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params)
    } catch (err) {
      console.error('数据库查询错误:', err.message)
      throw err
    }
  },
  pool
}
