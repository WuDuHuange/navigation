const jwt = require('jsonwebtoken')
const { getJwtSecret } = require('../config/security')

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: '未授权访问',
      code: 'AUTH_REQUIRED',
      requestId: req.requestId || null
    })
  }
  
  const token = authHeader.split(' ')[1]
  let jwtSecret

  try {
    jwtSecret = getJwtSecret()
  } catch (err) {
    console.error('Auth config error:', err.message)
    return res.status(500).json({
      error: '服务配置错误，请联系管理员',
      code: 'INTERNAL_ERROR',
      requestId: req.requestId || null
    })
  }
  
  try {
    const decoded = jwt.verify(token, jwtSecret)
    req.admin = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      error: 'Token 无效或已过期',
      code: 'INVALID_TOKEN',
      requestId: req.requestId || null
    })
  }
}
