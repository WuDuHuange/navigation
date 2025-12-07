const { GoogleGenerativeAI } = require('@google/generative-ai')

class AIService {
  constructor() {
    this.genAI = null
    this.model = null
  }

  /**
   * 初始化 Gemini AI 客户端
   */
  initialize(apiKey) {
    if (!apiKey) {
      console.log('⚠️ Gemini API Key 未配置，AI 总结功能不可用')
      return false
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      console.log('✅ Gemini AI 服务已初始化')
      return true
    } catch (err) {
      console.error('❌ Gemini AI 初始化失败:', err.message)
      return false
    }
  }

  /**
   * 检查服务是否可用
   */
  isAvailable() {
    return this.model !== null
  }

  /**
   * 为文章生成 AI 总结
   * @param {string} title - 文章标题
   * @param {string} content - 文章内容（Markdown）
   * @returns {Promise<string>} 总结文本
   */
  async generateSummary(title, content) {
    if (!this.isAvailable()) {
      throw new Error('AI 服务不可用，请先配置 Gemini API Key')
    }

    // 清理 Markdown 内容，移除图片链接等
    const cleanContent = content
      .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
      .replace(/\[.*?\]\(.*?\)/g, '$1') // 保留链接文字
      .replace(/```[\s\S]*?```/g, '[代码块]') // 简化代码块
      .replace(/`.*?`/g, '') // 移除行内代码
      .substring(0, 4000) // 限制长度

    const prompt = `请为以下文章生成一段简洁的中文总结（100-200字），概括文章的主要内容和核心观点。只需要返回总结内容，不要包含任何前缀或标签。

文章标题：${title}

文章内容：
${cleanContent}`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const summary = response.text().trim()
      
      return summary
    } catch (err) {
      console.error('AI 总结生成失败:', err.message)
      throw new Error('AI 总结生成失败: ' + err.message)
    }
  }

  /**
   * 动态更新 API Key
   */
  updateApiKey(apiKey) {
    return this.initialize(apiKey)
  }
}

// 单例模式
const aiService = new AIService()

// 初始化（使用环境变量中的 API Key）
aiService.initialize(process.env.GEMINI_API_KEY)

module.exports = aiService
