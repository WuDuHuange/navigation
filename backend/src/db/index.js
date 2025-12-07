const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// 测试连接
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL')
})

pool.on('error', (err) => {
  console.error('PostgreSQL error:', err.message)
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}
