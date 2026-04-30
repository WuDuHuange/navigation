const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { getJwtSecret } = require('../config/security')
const { createRateLimiter } = require('../middleware/rateLimit')

const router = express.Router()
const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: '登录尝试过于频繁，请 15 分钟后再试',
  keyPrefix: 'login'
})

// POST /auth/login
router.post('/login', loginRateLimit, async (req, res, next) => {
  try {
    let jwtSecret
    try {
      jwtSecret = getJwtSecret()
    } catch (err) {
      return res.status(500).json({ error: '服务配置错误，请联系管理员' })
    }

    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码为必填项' })
    }
    
    const result = await db.query('SELECT * FROM admins WHERE username = $1', [username])
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }
    
    const admin = result.rows[0]
    const validPassword = await bcrypt.compare(password, admin.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }
    
    const token = jwt.sign({ id: admin.id, username: admin.username }, jwtSecret, { expiresIn: '7d' })
    
    await db.query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [admin.id])
    
    res.json({
      success: true,
      data: {
        token,
        admin: { id: admin.id, username: admin.username }
      }
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
