require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')

const linksRouter = require('./routes/links')
const articlesRouter = require('./routes/articles')
const commentsRouter = require('./routes/comments')
const authRouter = require('./routes/auth')
const uploadRouter = require('./routes/upload')
const settingsRouter = require('./routes/settings')

const app = express()
const PORT = process.env.PORT || 4000

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// 静态文件服务（图片上传目录）
const uploadDir = process.env.UPLOAD_DIR || 'uploads'
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)))

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 个请求
  message: { error: '请求过于频繁，请稍后再试' }
})
app.use('/api/', limiter)

// 解析 JSON
app.use(express.json({ limit: '10kb' }))

// API 路由
app.use('/api/v1/links', linksRouter)
app.use('/api/v1/articles', articlesRouter)
app.use('/api/v1/comments', commentsRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/upload', uploadRouter)
app.use('/api/v1/settings', settingsRouter)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

module.exports = app
