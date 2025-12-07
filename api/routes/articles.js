const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/auth')
const aiService = require('../services/ai')

const router = express.Router()

// GET /articles
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 10, 50)
    const offset = (page - 1) * limit

    const result = await db.query(
      `SELECT id, title, slug, summary, ai_summary, tags, view_count, created_at 
       FROM articles WHERE published = true ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    
    const countResult = await db.query('SELECT COUNT(*) FROM articles WHERE published = true')
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

// GET /articles/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params
    const result = await db.query(
      'SELECT * FROM articles WHERE slug = $1 AND published = true',
      [slug]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在' })
    }
    await db.query('UPDATE articles SET view_count = view_count + 1 WHERE slug = $1', [slug])
    const article = result.rows[0]
    article.view_count += 1
    res.json({ success: true, data: article })
  } catch (err) {
    next(err)
  }
})

// POST /articles
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, slug, content, summary, tags, published, generate_ai_summary } = req.body
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容为必填项' })
    }
    
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    
    let aiSummary = null
    if (generate_ai_summary !== false && aiService.isAvailable()) {
      try {
        aiSummary = await aiService.generateSummary(title, content)
      } catch (err) {
        console.error('AI 总结生成失败:', err.message)
      }
    }
    
    const result = await db.query(
      `INSERT INTO articles (title, slug, content, summary, ai_summary, tags, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, finalSlug, content, summary, aiSummary, tags || [], published || false]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'slug 已存在' })
    }
    next(err)
  }
})

// PUT /articles/:id
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, slug, content, summary, tags, published, regenerate_ai_summary } = req.body
    
    let aiSummary = undefined
    if (regenerate_ai_summary && content && aiService.isAvailable()) {
      try {
        const articleTitle = title || (await db.query('SELECT title FROM articles WHERE id = $1', [id])).rows[0]?.title
        aiSummary = await aiService.generateSummary(articleTitle, content)
      } catch (err) {
        console.error('AI 总结生成失败:', err.message)
      }
    }
    
    const result = await db.query(
      `UPDATE articles SET title = COALESCE($1, title), slug = COALESCE($2, slug),
       content = COALESCE($3, content), summary = COALESCE($4, summary),
       ai_summary = COALESCE($5, ai_summary), tags = COALESCE($6, tags),
       published = COALESCE($7, published), updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [title, slug, content, summary, aiSummary, tags, published, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// POST /articles/:id/regenerate-summary
router.post('/:id/regenerate-summary', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    if (!aiService.isAvailable()) {
      return res.status(400).json({ error: 'AI 服务不可用' })
    }
    const articleResult = await db.query('SELECT title, content FROM articles WHERE id = $1', [id])
    if (articleResult.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在' })
    }
    const { title, content } = articleResult.rows[0]
    const aiSummary = await aiService.generateSummary(title, content)
    const result = await db.query(
      'UPDATE articles SET ai_summary = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [aiSummary, id]
    )
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// DELETE /articles/:id
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM articles WHERE id = $1', [id])
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
