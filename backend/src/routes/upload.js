const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_DIR || 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置 multer
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 默认 5MB
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

// POST /upload - 上传图片（需要认证）
router.post('/', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' })
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const filename = `${timestamp}-${randomStr}.webp`
    const filepath = path.join(uploadDir, filename)

    // 使用 sharp 处理图片（压缩、转换为 webp）
    await sharp(req.file.buffer)
      .resize(1920, 1080, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ quality: 85 })
      .toFile(filepath)

    // 返回图片 URL
    const imageUrl = `/uploads/${filename}`
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename,
        markdown: `![image](${imageUrl})`
      }
    })
  } catch (err) {
    next(err)
  }
})

// GET /upload/:filename - 获取图片
router.get('/:filename', (req, res, next) => {
  try {
    const { filename } = req.params
    const filepath = path.join(uploadDir, filename)
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: '图片不存在' })
    }
    
    res.sendFile(path.resolve(filepath))
  } catch (err) {
    next(err)
  }
})

// DELETE /upload/:filename - 删除图片（需要认证）
router.delete('/:filename', authMiddleware, (req, res, next) => {
  try {
    const { filename } = req.params
    const filepath = path.join(uploadDir, filename)
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }
    
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
