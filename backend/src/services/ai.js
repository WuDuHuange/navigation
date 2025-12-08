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
      this.apiKey = apiKey
      this.genAI = new GoogleGenerativeAI(apiKey)

      // 先尝试不指定模型，让服务或 SDK 选择默认模型
      try {
        this.model = this.genAI.getGenerativeModel()
      } catch (err) {
        // 若 SDK 要求模型名，尝试使用环境变量中指定的模型名
        const envModel = process.env.GEMINI_MODEL
        if (envModel) {
          try {
            this.model = this.genAI.getGenerativeModel({ model: envModel })
          } catch (e2) {
            console.warn('尝试使用环境变量 GEMINI_MODEL 指定模型失败:', e2.message)
          }
        }

        // 如果仍未获得 model，异步列出模型并挑选合适的
        if (!this.model) {
          (async () => {
            try {
              let list = null
              if (typeof this.genAI.listModels === 'function') {
                list = await this.genAI.listModels()
              } else {
                // SDK 不提供 listModels，使用 REST 接口回退
                try {
                  const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(this.apiKey)}`)
                  list = await resp.json()
                } catch (errFetch) {
                  console.warn('通过 REST 列出模型失败:', errFetch.message)
                }
              }
              const models = list && (list.models || list.model || [])
              const candidates = (models || []).filter(m => {
                const methods = m.supportedMethods || m.methods || []
                return methods.includes('generateContent') || methods.includes('generateText') || methods.includes('generate')
              })
              const pick = candidates[0] || (models && models[0])
              if (pick) {
                const name = pick.name || pick.id || pick.model
                try {
                  this.model = this.genAI.getGenerativeModel({ model: name })
                  console.log('✅ Gemini AI 自动选择模型:', name)
                } catch (e3) {
                  console.warn('使用自动选择的模型创建生成器失败:', e3.message)
                }
              }
            } catch (errList) {
              console.warn('列出 Gemini 模型失败:', errList.message)
            }
          })()
        }
      }

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
    return this.genAI !== null && this.model !== null
  }

  /**
   * 为文章生成 AI 总结
   */
  async generateSummary(title, content) {
    if (!this.isAvailable()) {
      throw new Error('AI 服务不可用，请先配置 Gemini API Key')
    }

    const cleanContent = content
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '$1')
      .replace(/```[\s\S]*?```/g, '[代码块]')
      .replace(/`.*?`/g, '')
      .substring(0, 4000)

    const prompt = `请为以下文章生成一段简洁的中文总结（100-200字），概括文章的主要内容和核心观点。只需要返回总结内容，不要包含任何前缀或标签。

文章标题：${title}

文章内容：
${cleanContent}`

    try {
      const result = await this.model.generateContent(prompt)
      // 兼容不同返回结构
      if (result && result.response && typeof result.response.text === 'function') {
        const response = await result.response
        return response.text().trim()
      }
      if (result && typeof result.text === 'string') {
        return result.text.trim()
      }
      return String(result).trim()
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
