const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// GET /audit-logs - 查询审计日志（需要登录）
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)
    const offset = (page - 1) * limit
    const action = req.query.action

    let whereClause = ''
    let params = [limit, offset]
    if (action) {
      whereClause = 'WHERE action = $3'
      params = [limit, offset, action]
    }

    const result = await db.query(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      params
    )

    let countResult
    if (action) {
      countResult = await db.query('SELECT COUNT(*) FROM audit_logs WHERE action = $1', [action])
    } else {
      countResult = await db.query('SELECT COUNT(*) FROM audit_logs')
    }

    const total = parseInt(countResult.rows[0].count)

    res.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
