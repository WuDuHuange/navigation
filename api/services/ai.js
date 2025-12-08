const { GoogleGenerativeAI } = require('@google/generative-ai')

class AIService {
  constructor() {
    this.genAI = null
    this.model = null
  }

  /**
   * 初始化：优先不指定模型让客户端选择默认；若失败，尝试异步列出模型并自动选择一个支持生成的方法。
   */
  initialize(apiKey) {
    if (!apiKey) return false
    try {
      this.genAI = new GoogleGenerativeAI(apiKey)

      // 优先尝试不指定模型（让 SDK/服务选择默认模型）
      try {
        this.model = this.genAI.getGenerativeModel()
      } catch (err) {
        // 如果 SDK 要求模型名，尝试从环境变量读取可选模型名
        const envModel = process.env.GEMINI_MODEL
        if (envModel) {
          try {
            this.model = this.genAI.getGenerativeModel({ model: envModel })
          } catch (e2) {
            console.warn('尝试使用环境变量 GEMINI_MODEL 指定模型失败:', e2.message)
          }
        }

        // 如果仍然没有模型，异步列出模型并尝试选择一个合适的
        if (!this.model) {
          (async () => {
            try {
              const list = await this.genAI.listModels()
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
                  console.log('Gemini AI 自动选择模型:', name)
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

      return true
    } catch (err) {
      console.error('Gemini AI 初始化失败:', err.message)
      return false
    }
  }

  isAvailable() {
    return this.genAI !== null && this.model !== null
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

    // 兼容不同 SDK 返回结构
    const result = await this.model.generateContent(prompt)
    // 有的 SDK 返回 Promise -> { response }，response.text() 也可能是可用方法
    if (result && result.response && typeof result.response.text === 'function') {
      return (await result.response.text()).trim()
    }
    // 退化为直接读取 text 字段
    if (result && typeof result.text === 'string') {
      return result.text.trim()
    }
    // 最后尝试将整个结果转为字符串
    return String(result).trim()
  }

  updateApiKey(apiKey) {
    return this.initialize(apiKey)
  }
}

module.exports = new AIService()
