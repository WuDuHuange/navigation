const { GoogleGenerativeAI } = require('@google/generative-ai')

class AIService {
  constructor() {
    this.genAI = null
    this.model = null
  }

  initialize(apiKey) {
    if (!apiKey) return false
    try {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      return true
    } catch (err) {
      console.error('Gemini AI 初始化失败:', err.message)
      return false
    }
  }

  isAvailable() {
    return this.model !== null
  }

  async generateSummary(title, content) {
    if (!this.isAvailable()) {
      throw new Error('AI 服务不可用')
    }

    const cleanContent = content
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '$1')
      .replace(/```[\s\S]*?```/g, '[代码块]')
      .substring(0, 4000)

    const prompt = `请为以下文章生成一段简洁的中文总结（100-200字），只返回总结内容：

文章标题：${title}

文章内容：
${cleanContent}`

    const result = await this.model.generateContent(prompt)
    return result.response.text().trim()
  }

  updateApiKey(apiKey) {
    return this.initialize(apiKey)
  }
}

module.exports = new AIService()
