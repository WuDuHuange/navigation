const db = require('../db')

function resolveClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return req.ip || 'unknown'
}

function auditLog(action, resource, getResourceId) {
  return async (req, res, next) => {
    const oldJson = res.json.bind(res)

    res.json = function (body) {
      ;(async () => {
        try {
          const admin = req.admin || {}
          const resourceId = typeof getResourceId === 'function'
            ? getResourceId(body, req)
            : req.params?.id || null

          const detail = typeof body === 'object' ? JSON.stringify({
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            success: body?.success
          }) : String(body || '')

          await db.query(
            `INSERT INTO audit_logs (admin_id, admin_username, action, resource, resource_id, detail, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              admin.id || null,
              admin.username || 'system',
              action,
              resource,
              resourceId,
              detail,
              resolveClientIp(req),
              req.headers['user-agent'] || null
            ]
          )
        } catch (err) {
          console.error('审计日志写入失败:', err.message)
        }
      })()

      return oldJson(body)
    }

    next()
  }
}

module.exports = {
  auditLog
}
