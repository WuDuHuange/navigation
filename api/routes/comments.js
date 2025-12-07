const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// GET /comments/article/:articleId
router.get('/article/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params
    const result = await db.query(
      `SELECT id, nickname, content, created_at FROM comments 
       WHERE article_id = $1 AND is_approved = true ORDER BY created_at DESC`,
      [articleId]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

// POST /comments
router.post('/', async (req, res, next) => {
  try {
    const { article_id, nickname, email, content } = req.body
    if (!article_id || !nickname || !content) {
      return res.status(400).json({ error: '缺少必填字段' })
    }
    const ip = req.headers['x-forwarded-for'] || req.ip
    const result = await db.query(
      `INSERT INTO comments (article_id, nickname, email, content, ip_address)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nickname, content, created_at`,
      [article_id, nickname, email, content, ip]
    )
    res.status(201).json({ success: true, data: result.rows[0], message: '评论已提交，等待审核' })
  } catch (err) {
    next(err)
  }
})

// PUT /comments/:id/approve
router.put('/:id/approve', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { approved } = req.body
    await db.query('UPDATE comments SET is_approved = $1 WHERE id = $2', [approved, id])
    res.json({ success: true, message: approved ? '已通过' : '已拒绝' })
  } catch (err) {
    next(err)
  }
})

// DELETE /comments/:id
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM comments WHERE id = $1', [id])
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
