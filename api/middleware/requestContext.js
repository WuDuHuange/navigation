const crypto = require('crypto')

function createRequestId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function resolveClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return req.ip || 'unknown'
}

module.exports = (req, res, next) => {
  const startedAt = Date.now()
  const requestId = req.headers['x-request-id'] || createRequestId()

  req.requestId = requestId
  res.setHeader('x-request-id', requestId)

  res.on('finish', () => {
    const log = {
      level: 'info',
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: resolveClientIp(req),
      userAgent: req.headers['user-agent'] || ''
    }
    console.log(JSON.stringify(log))
  })

  next()
}
