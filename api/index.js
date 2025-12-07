const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const app = express()

// 中间件
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// 路由
app.use('/api/v1/links', require('./routes/links'))
app.use('/api/v1/articles', require('./routes/articles'))
app.use('/api/v1/comments', require('./routes/comments'))
app.use('/api/v1/auth', require('./routes/auth'))
app.use('/api/v1/settings', require('./routes/settings'))
app.use('/api/v1/upload', require('./routes/upload'))

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  })
})

module.exports = app
