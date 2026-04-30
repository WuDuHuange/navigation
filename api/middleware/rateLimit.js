const buckets = new Map()

function resolveClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return req.ip || 'unknown'
}

function createRateLimiter({ windowMs, max, message, keyPrefix }) {
  return (req, res, next) => {
    const now = Date.now()
    const ip = resolveClientIp(req)
    const key = `${keyPrefix}:${ip}`

    let bucket = buckets.get(key)
    if (!bucket || now > bucket.resetAt) {
      bucket = {
        count: 0,
        resetAt: now + windowMs
      }
    }

    bucket.count += 1
    buckets.set(key, bucket)

    if (bucket.count > max) {
      return res.status(429).json({
        error: message || 'Too many requests',
        code: 'RATE_LIMITED',
        requestId: req.requestId || null
      })
    }

    next()
  }
}

module.exports = {
  createRateLimiter
}
