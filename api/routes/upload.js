const express = require('express')
const multer = require('multer')
const authMiddleware = require('../middleware/auth')
const { uploadImage, isConfigured } = require('../services/cloudinary')

const router = express.Router()

// 配置 multer（内存存储）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持 JPEG、PNG、GIF、WebP 格式的图片'))
    }
  }
})

// POST /upload - 上传图片
router.post('/', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' })
    }

    if (!isConfigured()) {
      return res.status(500).json({ error: '图片服务未配置，请设置 Cloudinary 环境变量' })
    }

    // 上传到 Cloudinary
    const result = await uploadImage(req.file.buffer)
    
    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        markdown: `![image](${result.secure_url})`
      }
    })
  } catch (err) {
    console.error('图片上传失败:', err.message)
    res.status(500).json({ error: '图片上传失败: ' + err.message })
  }
})

// GET /upload/status - 检查图片服务状态
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: isConfigured(),
      provider: 'cloudinary'
    }
  })
})

module.exports = router
