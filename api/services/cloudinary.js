const cloudinary = require('cloudinary').v2

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * 上传图片到 Cloudinary
 * @param {Buffer} buffer - 图片 buffer
 * @param {string} folder - 存储文件夹
 * @returns {Promise<object>} 上传结果
 */
async function uploadImage(buffer, folder = 'navigation') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    
    // 将 buffer 写入 stream
    const Readable = require('stream').Readable
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)
    stream.pipe(uploadStream)
  })
}

/**
 * 删除图片
 * @param {string} publicId - Cloudinary public_id
 */
async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId)
}

/**
 * 检查 Cloudinary 是否已配置
 */
function isConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  isConfigured
}
