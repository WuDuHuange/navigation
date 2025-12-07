const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// DELETE /comments/:id - 删除评论（需要认证）
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await db.query('DELETE FROM comments WHERE id = $1 RETURNING id', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '评论不存在' })
    }
    
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    next(err)
  }
})

// PUT /comments/:id/approve - 审核评论（需要认证）
router.put('/:id/approve', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { approved } = req.body
    
    const result = await db.query(
      'UPDATE comments SET is_approved = $1 WHERE id = $2 RETURNING *',
      [approved !== false, id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '评论不存在' })
    }
    
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// GET /comments/pending - 获取待审核评论（需要认证）
router.get('/pending', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT c.*, a.title as article_title 
       FROM comments c 
       JOIN articles a ON c.article_id = a.id 
       WHERE c.is_approved = false 
       ORDER BY c.created_at DESC`
    )
    
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

module.exports = router
