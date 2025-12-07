const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
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
    
    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '7d' })
    
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
