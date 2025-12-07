const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/auth')
const aiService = require('../services/ai')

const router = express.Router()

// GET /settings
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query('SELECT key, value FROM settings')
    const settings = {}
    result.rows.forEach(row => {
      if (row.key === 'gemini_api_key' && row.value) {
        settings[row.key] = '******' + row.value.slice(-4)
      } else {
        settings[row.key] = row.value
      }
    })
    settings.ai_available = aiService.isAvailable()
    res.json({ success: true, data: settings })
  } catch (err) {
    next(err)
  }
})

// PUT /settings
router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const { gemini_api_key } = req.body
    if (gemini_api_key !== undefined) {
      await db.query(`
        INSERT INTO settings (key, value) VALUES ('gemini_api_key', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
      `, [gemini_api_key])
      if (gemini_api_key) {
        aiService.updateApiKey(gemini_api_key)
      }
    }
    res.json({ success: true, message: '设置已保存', data: { ai_available: aiService.isAvailable() } })
  } catch (err) {
    next(err)
  }
})

// POST /settings/test-ai
router.post('/test-ai', authMiddleware, async (req, res, next) => {
  try {
    if (!aiService.isAvailable()) {
      return res.status(400).json({ error: 'AI 服务不可用' })
    }
    const testSummary = await aiService.generateSummary('测试', '这是测试内容')
    res.json({ success: true, data: { test_summary: testSummary } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
