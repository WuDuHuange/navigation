const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// GET /links - 获取所有导航链接
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM links WHERE is_active = true ORDER BY sort_order ASC, created_at DESC'
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

// GET /links/:id - 获取单个链接
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await db.query('SELECT * FROM links WHERE id = $1', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '链接不存在' })
    }
    
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// POST /links - 创建链接（需要认证）
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, description, url, icon, category, sort_order } = req.body
    
    if (!title || !url) {
      return res.status(400).json({ error: '标题和链接地址为必填项' })
    }
    
    const result = await db.query(
      `INSERT INTO links (title, description, url, icon, category, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, url, icon || '🔗', category || '默认', sort_order || 0]
    )
    
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// PUT /links/:id - 更新链接（需要认证）
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, description, url, icon, category, sort_order, is_active } = req.body
    
    const result = await db.query(
      `UPDATE links SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        url = COALESCE($3, url),
        icon = COALESCE($4, icon),
        category = COALESCE($5, category),
        sort_order = COALESCE($6, sort_order),
        is_active = COALESCE($7, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [title, description, url, icon, category, sort_order, is_active, id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '链接不存在' })
    }
    
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// DELETE /links/:id - 删除链接（需要认证）
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await db.query('DELETE FROM links WHERE id = $1 RETURNING id', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '链接不存在' })
    }
    
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
