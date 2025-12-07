const { Pool } = require('pg')

// 移除 channel_binding 参数（pg 库不支持）
let connectionString = process.env.DATABASE_URL || ''
connectionString = connectionString.replace('&channel_binding=require', '')

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}
