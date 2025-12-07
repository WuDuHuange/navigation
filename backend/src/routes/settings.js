const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/auth')
const aiService = require('../services/ai')

const router = express.Router()

// GET /settings - 获取系统设置（需要认证）
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query('SELECT key, value FROM settings')
    const settings = {}
    result.rows.forEach(row => {
      // 隐藏敏感信息
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

// PUT /settings - 更新系统设置（需要认证）
router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const { gemini_api_key } = req.body
    
    if (gemini_api_key !== undefined) {
      // 保存到数据库
      await db.query(`
        INSERT INTO settings (key, value) VALUES ('gemini_api_key', $1)
        ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
      `, [gemini_api_key])
      
      // 更新 AI 服务
      if (gemini_api_key) {
        aiService.updateApiKey(gemini_api_key)
      }
    }
    
    res.json({ 
      success: true, 
      message: '设置已保存',
      data: { ai_available: aiService.isAvailable() }
    })
  } catch (err) {
    next(err)
  }
})

// POST /settings/test-ai - 测试 AI 连接（需要认证）
router.post('/test-ai', authMiddleware, async (req, res, next) => {
  try {
    if (!aiService.isAvailable()) {
      return res.status(400).json({ error: 'AI 服务不可用，请先配置 API Key' })
    }
    
    const testSummary = await aiService.generateSummary(
      '测试文章',
      '这是一篇用于测试 AI 总结功能的文章。'
    )
    
    res.json({ 
      success: true, 
      message: 'AI 服务连接正常',
      data: { test_summary: testSummary }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
