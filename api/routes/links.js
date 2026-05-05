const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/auth')
const { auditLog } = require('../middleware/auditLog')

const router = express.Router()

// GET /links
router.get('/', async (req, res, next) => {
  try {
    const sort = req.query.sort
    const search = req.query.search
    let orderClause = 'ORDER BY sort_order ASC, created_at DESC'
    if (sort === 'hot') {
      orderClause = 'ORDER BY click_count DESC, created_at DESC'
    }

    let whereClause = 'WHERE is_active = true'
    let params = []
    if (search && search.trim()) {
      whereClause += ` AND (title ILIKE $1 OR description ILIKE $1 OR url ILIKE $1)`
      params.push(`%${search.trim()}%`)
    }

    const result = await db.query(
      `SELECT * FROM links ${whereClause} ${orderClause}`,
      params
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

// GET /links/admin/all
router.get('/admin/all', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM links ORDER BY sort_order ASC, created_at DESC'
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

// POST /links
router.post('/', authMiddleware, auditLog('CREATE_LINK', 'links', (body) => body?.data?.id), async (req, res, next) => {
  try {
    const { title, url, description, icon, category, sort_order } = req.body
    if (!title || !url) {
      return res.status(400).json({ error: '标题和链接为必填项' })
    }
    const result = await db.query(
      `INSERT INTO links (title, url, description, icon, category, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, url, description, icon || '🔗', category || '默认', sort_order || 0]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// PUT /links/:id
router.put('/:id', authMiddleware, auditLog('UPDATE_LINK', 'links', (body, req) => req.params.id), async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, url, description, icon, category, sort_order, is_active } = req.body
    const result = await db.query(
      `UPDATE links SET title = COALESCE($1, title), url = COALESCE($2, url),
       description = COALESCE($3, description), icon = COALESCE($4, icon),
       category = COALESCE($5, category), sort_order = COALESCE($6, sort_order),
       is_active = COALESCE($7, is_active), updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [title, url, description, icon, category, sort_order, is_active, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '链接不存在' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// DELETE /links/:id
router.delete('/:id', authMiddleware, auditLog('DELETE_LINK', 'links', (body, req) => req.params.id), async (req, res, next) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM links WHERE id = $1', [id])
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    next(err)
  }
})

// POST /links/:id/click - 记录链接点击
router.post('/:id/click', async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await db.query(
      'UPDATE links SET click_count = click_count + 1 WHERE id = $1 RETURNING click_count',
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '链接不存在' })
    }
    res.json({ success: true, data: { click_count: result.rows[0].click_count } })
  } catch (err) {
    next(err)
  }
})

// GET /links/health - 链接健康检查（需要登录）
router.get('/health', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, title, url FROM links WHERE is_active = true'
    )
    const checks = await Promise.allSettled(
      result.rows.map(async (link) => {
        try {
          const controller = new AbortController()
          const timer = setTimeout(() => controller.abort(), 8000)
          const response = await fetch(link.url, {
            method: 'HEAD',
            signal: controller.signal,
            redirect: 'follow'
          })
          clearTimeout(timer)
          return {
            id: link.id,
            title: link.title,
            url: link.url,
            status: response.status,
            ok: response.ok
          }
        } catch {
          return {
            id: link.id,
            title: link.title,
            url: link.url,
            status: 0,
            ok: false,
            error: '连接失败或超时'
          }
        }
      })
    )
    const data = checks.map((c, i) => (c.status === 'fulfilled' ? c.value : {
      id: result.rows[i].id,
      title: result.rows[i].title,
      url: result.rows[i].url,
      status: 0,
      ok: false,
      error: c.reason?.message || '未知错误'
    }))
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

module.exports = router
