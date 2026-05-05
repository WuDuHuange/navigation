const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/auth')
const { createRateLimiter } = require('../middleware/rateLimit')
const { auditLog } = require('../middleware/auditLog')
const { validateNickname, validateContent } = require('../utils/commentValidator')

const router = express.Router()
const commentRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 6,
  message: '评论提交过于频繁，请稍后再试',
  keyPrefix: 'comment'
})

// GET /comments/pending - 获取待审核评论（需要登录）
router.get('/pending', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.article_id, c.nickname, c.email, c.content, c.ip_address, c.created_at,
              a.title as article_title, a.slug as article_slug
       FROM comments c
       LEFT JOIN articles a ON c.article_id = a.id
       WHERE c.is_approved = false 
       ORDER BY c.created_at DESC`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

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
router.post('/', commentRateLimit, async (req, res, next) => {
  try {
    const { article_id, nickname, email, content } = req.body
    if (!article_id || !nickname || !content) {
      return res.status(400).json({ error: '缺少必填字段' })
    }

    // 昵称校验
    const nicknameErr = validateNickname(nickname)
    if (nicknameErr) {
      return res.status(400).json({ error: nicknameErr, code: 'INVALID_NICKNAME' })
    }

    // 内容校验
    const contentErr = validateContent(content)
    if (contentErr) {
      return res.status(400).json({ error: contentErr.error, code: contentErr.code })
    }

    const ip = req.headers['x-forwarded-for'] || req.ip

    // 重复内容检测：同一 IP 5 分钟内相同内容
    const dupResult = await db.query(
      `SELECT id FROM comments WHERE ip_address = $1 AND content = $2 AND created_at > NOW() - INTERVAL '5 minutes'`,
      [ip, content]
    )
    if (dupResult.rows.length > 0) {
      return res.status(400).json({
        error: '请勿重复提交相同评论',
        code: 'DUPLICATE_COMMENT'
      })
    }

    // 验证文章存在
    const articleResult = await db.query('SELECT id FROM articles WHERE id = $1', [article_id])
    if (articleResult.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在', code: 'NOT_FOUND' })
    }

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
router.put('/:id/approve', authMiddleware, auditLog('APPROVE_COMMENT', 'comments', (body, req) => req.params.id), async (req, res, next) => {
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
router.delete('/:id', authMiddleware, auditLog('DELETE_COMMENT', 'comments', (body, req) => req.params.id), async (req, res, next) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM comments WHERE id = $1', [id])
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
