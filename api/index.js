const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const requestContext = require('./middleware/requestContext')

const app = express()

// 中间件
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())
app.use(requestContext)
app.use(express.json({ limit: '10mb' }))

// 路由
app.use('/api/v1/links', require('./routes/links'))
app.use('/api/v1/articles', require('./routes/articles'))
app.use('/api/v1/comments', require('./routes/comments'))
app.use('/api/v1/auth', require('./routes/auth'))
app.use('/api/v1/audit-logs', require('./routes/auditLogs'))
app.use('/api/v1/settings', require('./routes/settings'))
app.use('/api/v1/upload', require('./routes/upload'))

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 错误处理
app.use((err, req, res, next) => {
  const status = err.status || 500
  const code = err.code || 'INTERNAL_ERROR'
  const requestId = req.requestId || 'unknown'

  console.error(JSON.stringify({
    level: 'error',
    requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    code,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  }))

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    code,
    requestId
  })
})

module.exports = app
