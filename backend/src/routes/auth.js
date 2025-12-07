const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

const router = express.Router()

// POST /auth/login - 管理员登录
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码为必填项' })
    }
    
    // 查找用户
    const result = await db.query('SELECT * FROM admins WHERE username = $1', [username])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }
    
    const admin = result.rows[0]
    
    // 验证密码
    const isValid = await bcrypt.compare(password, admin.password_hash)
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }
    
    // 更新最后登录时间
    await db.query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [admin.id])
    
    // 生成 JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username
        }
      }
    })
  } catch (err) {
    next(err)
  }
})

// POST /auth/refresh - 刷新 Token
router.post('/refresh', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权访问' })
    }
    
    const oldToken = authHeader.split(' ')[1]
    
    try {
      const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true })
      
      // 生成新 Token
      const newToken = jwt.sign(
        { id: decoded.id, username: decoded.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )
      
      res.json({ success: true, data: { token: newToken } })
    } catch (err) {
      return res.status(401).json({ error: 'Token 无效' })
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
