const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/auth')
const aiService = require('../services/ai')

const router = express.Router()

// GET /articles - 获取文章列表
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 10, 50)
    const offset = (page - 1) * limit
    const tag = req.query.tag

    let query = 'SELECT id, title, slug, summary, ai_summary, tags, view_count, created_at FROM articles WHERE published = true'
    const params = []
    
    if (tag) {
      query += ' AND $1 = ANY(tags)'
      params.push(tag)
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    params.push(limit, offset)
    
    const result = await db.query(query, params)
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) FROM articles WHERE published = true'
    const countParams = []
    if (tag) {
      countQuery += ' AND $1 = ANY(tags)'
      countParams.push(tag)
    }
    const countResult = await db.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].count)
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    next(err)
  }
})

// GET /articles/:slug - 获取文章详情
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params
    
    // 查询文章
    const result = await db.query(
      'SELECT * FROM articles WHERE slug = $1 AND published = true',
      [slug]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在' })
    }
    
    // 增加浏览量
    await db.query('UPDATE articles SET view_count = view_count + 1 WHERE slug = $1', [slug])
    
    const article = result.rows[0]
    article.view_count += 1
    
    res.json({ success: true, data: article })
  } catch (err) {
    next(err)
  }
})

// POST /articles - 创建文章（需要认证）
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, slug, content, summary, tags, published, generate_ai_summary } = req.body
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容为必填项' })
    }
    
    // 生成 slug（如果没有提供）
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')
    
    // 生成 AI 总结（如果请求且服务可用）
    let aiSummary = null
    if (generate_ai_summary !== false && aiService.isAvailable()) {
      try {
        aiSummary = await aiService.generateSummary(title, content)
      } catch (err) {
        console.error('AI 总结生成失败:', err.message)
        // 不阻止文章保存
      }
    }
    
    const result = await db.query(
      `INSERT INTO articles (title, slug, content, summary, ai_summary, tags, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, finalSlug, content, summary, aiSummary, tags || [], published || false]
    )
    
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (err) {
    if (err.code === '23505') { // 唯一约束冲突
      return res.status(400).json({ error: 'slug 已存在，请使用其他标识' })
    }
    next(err)
  }
})

// PUT /articles/:id - 更新文章（需要认证）
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, slug, content, summary, tags, published, regenerate_ai_summary } = req.body
    
    // 如果内容有更新且需要重新生成 AI 总结
    let aiSummary = undefined // undefined 表示不更新
    if (regenerate_ai_summary && content && aiService.isAvailable()) {
      try {
        const articleTitle = title || (await db.query('SELECT title FROM articles WHERE id = $1', [id])).rows[0]?.title
        aiSummary = await aiService.generateSummary(articleTitle, content)
      } catch (err) {
        console.error('AI 总结生成失败:', err.message)
      }
    }
    
    const result = await db.query(
      `UPDATE articles SET 
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        content = COALESCE($3, content),
        summary = COALESCE($4, summary),
        ai_summary = COALESCE($5, ai_summary),
        tags = COALESCE($6, tags),
        published = COALESCE($7, published),
        updated_at = CURRENT_TIMESTAMP
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

// POST /articles/:id/regenerate-summary - 重新生成 AI 总结（需要认证）
router.post('/:id/regenerate-summary', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    
    if (!aiService.isAvailable()) {
      return res.status(400).json({ error: 'AI 服务不可用，请先配置 Gemini API Key' })
    }
    
    // 获取文章
    const articleResult = await db.query('SELECT title, content FROM articles WHERE id = $1', [id])
    if (articleResult.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在' })
    }
    
    const { title, content } = articleResult.rows[0]
    
    // 生成 AI 总结
    const aiSummary = await aiService.generateSummary(title, content)
    
    // 更新文章
    const result = await db.query(
      'UPDATE articles SET ai_summary = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [aiSummary, id]
    )
    
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// DELETE /articles/:id - 删除文章（需要认证）
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await db.query('DELETE FROM articles WHERE id = $1 RETURNING id', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在' })
    }
    
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    next(err)
  }
})

// GET /articles/:id/comments - 获取文章评论
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params
    
    const result = await db.query(
      `SELECT id, nickname, content, created_at 
       FROM comments 
       WHERE article_id = $1 AND is_approved = true 
       ORDER BY created_at DESC`,
      [id]
    )
    
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

// POST /articles/:id/comments - 发表评论
router.post('/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params
    const { nickname, email, content } = req.body
    
    if (!nickname || !content) {
      return res.status(400).json({ error: '昵称和内容为必填项' })
    }
    
    // 检查文章是否存在
    const articleExists = await db.query('SELECT id FROM articles WHERE id = $1', [id])
    if (articleExists.rows.length === 0) {
      return res.status(404).json({ error: '文章不存在' })
    }
    
    // 获取 IP 地址
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    
    const result = await db.query(
      `INSERT INTO comments (article_id, nickname, email, content, ip_address)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nickname, content, created_at`,
      [id, nickname, email, content, ip]
    )
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      message: '评论已提交，等待审核'
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
