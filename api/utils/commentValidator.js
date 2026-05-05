// 简单敏感词列表（可扩展为数据库配置）
const BLOCKED_WORDS = []

const BLOCKED_PATTERNS = [
  /https?:\/\/\S+/i,      // URL 链接
  /<[^>]*>/,              // HTML 标签
]

function validateNickname(name) {
  if (!name || name.length < 2) return '昵称至少 2 个字符'
  if (name.length > 20) return '昵称最多 20 个字符'
  if (BLOCKED_PATTERNS.some(p => p.test(name))) return '昵称不能包含链接或 HTML 标签'
  return null
}

function validateContent(text) {
  if (!text || text.length < 2) return { error: '评论内容至少 2 个字符', code: 'CONTENT_TOO_SHORT' }
  if (text.length > 2000) return { error: '评论内容最多 2000 个字符', code: 'CONTENT_TOO_LONG' }
  if (BLOCKED_PATTERNS.some(p => p.test(text))) return { error: '评论内容不能包含链接或 HTML 标签', code: 'INVALID_CONTENT' }
  const lower = text.toLowerCase()
  if (BLOCKED_WORDS.some(w => lower.includes(w.toLowerCase()))) return { error: '评论内容包含不当词汇', code: 'INVALID_CONTENT' }
  return null
}

module.exports = {
  validateNickname,
  validateContent
}
