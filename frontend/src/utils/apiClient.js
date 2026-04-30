const API_BASE = import.meta.env.VITE_API_URL || ''

const ERROR_MESSAGE_MAP = {
  400: '请求参数有误，请检查后重试',
  401: '登录状态已失效，请重新登录',
  403: '没有权限执行该操作',
  404: '请求资源不存在',
  409: '数据冲突，请刷新后重试',
  422: '提交数据格式不正确',
  429: '操作过于频繁，请稍后再试',
  500: '服务开小差了，请稍后重试',
  502: '网关错误，请稍后重试',
  503: '服务暂时不可用，请稍后重试'
}

const ERROR_CODE_MESSAGE_MAP = {
  INTERNAL_ERROR: '服务内部错误，请稍后重试',
  AUTH_REQUIRED: '请先登录再继续操作',
  INVALID_TOKEN: '登录状态已失效，请重新登录',
  RATE_LIMITED: '操作过于频繁，请稍后再试'
}

export class ApiError extends Error {
  constructor(message, status = 0, payload = null, code = null, requestId = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
    this.code = code
    this.requestId = requestId
  }
}

function resolveErrorMessage(status, payload) {
  const code = payload?.code
  if (code && ERROR_CODE_MESSAGE_MAP[code]) {
    return ERROR_CODE_MESSAGE_MAP[code]
  }
  if (payload?.error || payload?.message) {
    return payload.error || payload.message
  }
  return ERROR_MESSAGE_MAP[status] || `请求失败 (${status})`
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE}${path}`
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 12000
  } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  const requestHeaders = { ...headers }
  let requestBody = body

  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json'
    requestBody = JSON.stringify(body)
  }

  try {
    const res = await fetch(buildUrl(path), {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal
    })

    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? await res.json() : await res.text()

    if (!res.ok) {
      const requestId = res.headers.get('x-request-id') || payload?.requestId || null
      const code = payload?.code || null
      const message = isJson ? resolveErrorMessage(res.status, payload) : `接口返回非 JSON 响应 (${res.status})`
      throw new ApiError(message, res.status, payload, code, requestId)
    }

    if (!isJson) {
      throw new ApiError('接口返回非 JSON 响应', res.status, payload)
    }

    return payload
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('请求超时，请稍后重试', 408)
    }
    if (err instanceof ApiError) throw err
    throw new ApiError(err.message || '网络请求失败')
  } finally {
    clearTimeout(timer)
  }
}
