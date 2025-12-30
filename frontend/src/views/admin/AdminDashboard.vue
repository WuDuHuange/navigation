<template>
  <div>
    <!-- 顶部栏 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">管理后台</h1>
        <p class="text-dark-400 mt-1">欢迎回来，{{ authStore.admin?.username }}</p>
      </div>
      <button
        @click="handleLogout"
        class="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded-lg transition-colors"
      >
        退出登录
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
        <div class="text-3xl mb-2">🔗</div>
        <div class="text-2xl font-bold text-white">{{ stats.links }}</div>
        <div class="text-dark-400 text-sm">导航链接</div>
      </div>
      <div class="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
        <div class="text-3xl mb-2">📝</div>
        <div class="text-2xl font-bold text-white">{{ stats.articles }}</div>
        <div class="text-dark-400 text-sm">文章数量</div>
      </div>
      <div class="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
        <div class="text-3xl mb-2">💬</div>
        <div class="text-2xl font-bold text-white">{{ stats.comments }}</div>
        <div class="text-dark-400 text-sm">总评论数</div>
      </div>
      <div class="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
        <div class="text-3xl mb-2">🤖</div>
        <div class="text-2xl font-bold" :class="settings.ai_available ? 'text-green-400' : 'text-dark-500'">
          {{ settings.ai_available ? '已连接' : '未配置' }}
        </div>
        <div class="text-dark-400 text-sm">AI 服务</div>
      </div>
    </div>

    <!-- Tab 导航 -->
    <div class="flex border-b border-dark-700 mb-6 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-6 py-3 font-medium transition-colors relative whitespace-nowrap',
          activeTab === tab.id
            ? 'text-primary-400'
            : 'text-dark-400 hover:text-white'
        ]"
      >
        {{ tab.icon }} {{ tab.name }}
        <span
          v-if="activeTab === tab.id"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
        ></span>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="bg-dark-800/50 border border-dark-700 rounded-xl p-6">
      <!-- 导航链接管理 -->
      <div v-if="activeTab === 'links'">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-white">导航链接列表</h2>
          <button
            @click="openLinkModal()"
            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            + 添加链接
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-dark-400 text-sm border-b border-dark-700">
                <th class="pb-3 pr-4">图标</th>
                <th class="pb-3 pr-4">标题</th>
                <th class="pb-3 pr-4">链接</th>
                <th class="pb-3 pr-4">分类</th>
                <th class="pb-3 pr-4">排序</th>
                <th class="pb-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="link in links" :key="link.id" class="border-b border-dark-700/50">
                <td class="py-4 pr-4 text-2xl">{{ link.icon }}</td>
                <td class="py-4 pr-4 text-white">{{ link.title }}</td>
                <td class="py-4 pr-4">
                  <a :href="link.url" target="_blank" class="text-primary-400 hover:underline text-sm truncate block max-w-[200px]">
                    {{ link.url }}
                  </a>
                </td>
                <td class="py-4 pr-4">
                  <span class="px-2 py-1 bg-dark-700 rounded text-sm text-dark-300">{{ link.category }}</span>
                </td>
                <td class="py-4 pr-4 text-dark-400">{{ link.sort_order }}</td>
                <td class="py-4">
                  <div class="flex gap-2">
                    <button @click="openLinkModal(link)" class="text-dark-400 hover:text-primary-400">
                      ✏️
                    </button>
                    <button @click="confirmDeleteLink(link)" class="text-dark-400 hover:text-red-400">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 文章管理 -->
      <div v-if="activeTab === 'articles'">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-white">文章列表</h2>
          <button
            @click="openArticleModal()"
            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            + 发布文章
          </button>
        </div>

        <div v-if="articles.length === 0" class="text-center py-12 text-dark-400">
          暂无文章，点击上方按钮发布第一篇
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="article in articles"
            :key="article.id"
            class="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg"
          >
            <div class="flex-1">
              <h3 class="text-white font-medium">{{ article.title }}</h3>
              <div class="flex flex-wrap items-center gap-3 mt-1 text-sm text-dark-400">
                <span>{{ formatDate(article.created_at) }}</span>
                <span>{{ article.view_count || 0 }} 阅读</span>
                <span :class="article.published ? 'text-green-400' : 'text-yellow-400'">
                  {{ article.published ? '已发布' : '草稿' }}
                </span>
                <span v-if="article.ai_summary" class="text-primary-400">🤖 已生成总结</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                v-if="settings.ai_available"
                @click="regenerateSummary(article)" 
                class="text-dark-400 hover:text-primary-400"
                title="重新生成 AI 总结"
              >
                🤖
              </button>
              <button @click="openArticleModal(article)" class="text-dark-400 hover:text-primary-400">
                ✏️
              </button>
              <button @click="confirmDeleteArticle(article)" class="text-dark-400 hover:text-red-400">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论管理 -->
      <div v-if="activeTab === 'comments'">
        <h2 class="text-lg font-semibold text-white mb-6">待审核评论</h2>
        
        <div v-if="pendingComments.length === 0" class="text-center py-12 text-dark-400">
          暂无待审核评论 🎉
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="comment in pendingComments"
            :key="comment.id"
            class="p-4 bg-dark-900/50 rounded-lg"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-medium text-white">{{ comment.nickname }}</span>
                  <span class="text-dark-500 text-sm">{{ comment.email }}</span>
                </div>
                <p class="text-dark-300 mb-2">{{ comment.content }}</p>
                <div class="text-xs text-dark-500">
                  文章：{{ comment.article_title }} · {{ formatDate(comment.created_at) }}
                </div>
              </div>
              <div class="flex gap-2 ml-4">
                <button
                  @click="approveComment(comment.id)"
                  class="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                >
                  ✓ 通过
                </button>
                <button
                  @click="deleteComment(comment.id)"
                  class="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  ✕ 删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统设置 -->
      <div v-if="activeTab === 'settings'">
        <h2 class="text-lg font-semibold text-white mb-6">系统设置</h2>
        
        <div class="space-y-6 max-w-xl">
          <!-- Gemini API Key -->
          <div class="bg-dark-900/50 rounded-lg p-4">
            <label class="block text-sm font-medium text-dark-300 mb-2">
              🤖 Gemini API Key
              <span class="text-dark-500 font-normal ml-2">用于生成文章 AI 总结</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="settingsForm.gemini_api_key"
                type="password"
                placeholder="输入你的 Gemini API Key"
                class="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none"
              />
              <button
                @click="saveSettings"
                :disabled="savingSettings"
                class="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-lg transition-colors"
              >
                {{ savingSettings ? '保存中...' : '保存' }}
              </button>
            </div>
            <p class="text-xs text-dark-500 mt-2">
              当前状态：
              <span :class="settings.ai_available ? 'text-green-400' : 'text-red-400'">
                {{ settings.ai_available ? '已配置' : '未配置' }}
              </span>
            </p>
            <p class="text-xs text-dark-500 mt-1">
              获取 API Key：<a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-primary-400 hover:underline">Google AI Studio</a>
            </p>
          </div>

          <!-- 测试 AI 连接 -->
          <div v-if="settings.ai_available" class="bg-dark-900/50 rounded-lg p-4">
            <label class="block text-sm font-medium text-dark-300 mb-2">测试 AI 连接</label>
            <button
              @click="testAI"
              :disabled="testingAI"
              class="px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:bg-dark-700/50 text-white rounded-lg transition-colors"
            >
              {{ testingAI ? '测试中...' : '🧪 测试连接' }}
            </button>
            <p v-if="aiTestResult" class="text-sm mt-2" :class="aiTestResult.success ? 'text-green-400' : 'text-red-400'">
              {{ aiTestResult.message }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 链接编辑弹窗 -->
    <div v-if="showLinkModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-white mb-4">
          {{ editingLink ? '编辑链接' : '添加链接' }}
        </h3>
        <form @submit.prevent="saveLinkForm" class="space-y-4">
          <div>
            <label class="block text-sm text-dark-400 mb-1">标题 *</label>
            <input v-model="linkForm.title" required class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label class="block text-sm text-dark-400 mb-1">链接地址 *</label>
            <input v-model="linkForm.url" required class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label class="block text-sm text-dark-400 mb-1">描述</label>
            <input v-model="linkForm.description" class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-dark-400 mb-1">图标</label>
              <input v-model="linkForm.icon" class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" placeholder="🔗" />
            </div>
            <div>
              <label class="block text-sm text-dark-400 mb-1">分类</label>
              <input v-model="linkForm.category" class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" placeholder="默认" />
            </div>
            <div>
              <label class="block text-sm text-dark-400 mb-1">排序</label>
              <input v-model.number="linkForm.sort_order" type="number" class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="showLinkModal = false" class="px-4 py-2 text-dark-400 hover:text-white">
              取消
            </button>
            <button type="submit" class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 文章编辑弹窗 -->
    <div v-if="showArticleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold text-white mb-4">
          {{ editingArticle ? '编辑文章' : '发布文章' }}
        </h3>
        <form @submit.prevent="saveArticleForm" class="space-y-4">
          <div>
            <label class="block text-sm text-dark-400 mb-1">标题 *</label>
            <input v-model="articleForm.title" required class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label class="block text-sm text-dark-400 mb-1">URL 标识 (slug)</label>
            <input v-model="articleForm.slug" class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" placeholder="留空自动生成" />
          </div>
          <div>
            <label class="block text-sm text-dark-400 mb-1">摘要</label>
            <input v-model="articleForm.summary" class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label class="block text-sm text-dark-400 mb-1">标签（逗号分隔）</label>
            <input v-model="articleForm.tagsInput" class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" placeholder="公告, 教程" />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm text-dark-400">内容 (Markdown) *</label>
              <ImageUpload @uploaded="onImageUploaded" />
            </div>
            <textarea 
              ref="contentTextarea"
              v-model="articleForm.content" 
              required 
              rows="14" 
              class="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white font-mono text-sm resize-none"
              placeholder="支持 Markdown 格式，可点击上方按钮插入图片"
            ></textarea>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <input v-model="articleForm.published" type="checkbox" id="published" class="rounded" />
              <label for="published" class="text-dark-300">立即发布</label>
            </div>
            <div v-if="settings.ai_available" class="flex items-center gap-2">
              <input v-model="articleForm.generateAISummary" type="checkbox" id="generateAI" class="rounded" />
              <label for="generateAI" class="text-dark-300">🤖 生成 AI 总结</label>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="showArticleModal = false" class="px-4 py-2 text-dark-400 hover:text-white">
              取消
            </button>
            <button type="submit" :disabled="savingArticle" class="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-lg">
              {{ savingArticle ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useLinksStore } from '../../stores/links'
import { useArticlesStore } from '../../stores/articles'
import ImageUpload from '../../components/common/ImageUpload.vue'

const router = useRouter()
const authStore = useAuthStore()
const linksStore = useLinksStore()
const articlesStore = useArticlesStore()

const API_URL = import.meta.env.VITE_API_URL || ''

const tabs = [
  { id: 'links', name: '导航链接', icon: '🔗' },
  { id: 'articles', name: '文章管理', icon: '📝' },
  { id: 'comments', name: '评论审核', icon: '💬' },
  { id: 'settings', name: '系统设置', icon: '⚙️' }
]

const activeTab = ref('links')
const stats = ref({ links: 0, articles: 0, comments: 0, pendingComments: 0 })
const links = ref([])
const articles = ref([])
const pendingComments = ref([])
const settings = ref({ ai_available: false, gemini_api_key: '' })

// 设置表单
const settingsForm = ref({ gemini_api_key: '' })
const savingSettings = ref(false)
const testingAI = ref(false)
const aiTestResult = ref(null)

// 链接表单
const showLinkModal = ref(false)
const editingLink = ref(null)
const linkForm = ref({ title: '', url: '', description: '', icon: '🔗', category: '默认', sort_order: 0 })

// 文章表单
const showArticleModal = ref(false)
const editingArticle = ref(null)
const articleForm = ref({ title: '', slug: '', summary: '', content: '', tagsInput: '', published: false, generateAISummary: true })
const savingArticle = ref(false)
const contentTextarea = ref(null)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/admin')
}

const fetchData = async () => {
  try {
    // 获取链接
    const linksRes = await fetch(`${API_URL}/api/v1/links`)
    const linksData = await linksRes.json()
    if (linksData.success) {
      links.value = linksData.data
      stats.value.links = linksData.data.length
    }

    // 获取文章
    const articlesRes = await fetch(`${API_URL}/api/v1/articles?limit=50`)
    const articlesData = await articlesRes.json()
    if (articlesData.success) {
      articles.value = articlesData.data
      stats.value.articles = articlesData.pagination?.total || articlesData.data.length
    }

    // 获取设置
    const settingsRes = await fetch(`${API_URL}/api/v1/settings`, {
      headers: authStore.getAuthHeaders()
    })
    if (settingsRes.ok) {
      const settingsData = await settingsRes.json()
      if (settingsData.success) {
        settings.value = settingsData.data
      }
    }

    // 获取待审核评论
    const commentsRes = await fetch(`${API_URL}/api/v1/comments/pending`, {
      headers: authStore.getAuthHeaders()
    })
    if (commentsRes.ok) {
      const commentsData = await commentsRes.json()
      if (commentsData.success) {
        pendingComments.value = commentsData.data
      }
    }
  } catch (err) {
    console.error('获取数据失败:', err)
  }

  stats.value.comments = 0
  stats.value.pendingComments = pendingComments.value.length
}

// 链接操作
const openLinkModal = (link = null) => {
  editingLink.value = link
  if (link) {
    linkForm.value = { ...link }
  } else {
    linkForm.value = { title: '', url: '', description: '', icon: '🔗', category: '默认', sort_order: 0 }
  }
  showLinkModal.value = true
}

const saveLinkForm = async () => {
  try {
    if (editingLink.value) {
      await linksStore.updateLink(editingLink.value.id, linkForm.value)
    } else {
      await linksStore.createLink(linkForm.value)
    }
    showLinkModal.value = false
    await fetchData()
  } catch (err) {
    alert(err.message)
  }
}

const confirmDeleteLink = async (link) => {
  if (confirm(`确定删除链接 "${link.title}" 吗？`)) {
    try {
      await linksStore.deleteLink(link.id)
      await fetchData()
    } catch (err) {
      alert(err.message)
    }
  }
}

// 文章操作
const openArticleModal = (article = null) => {
  editingArticle.value = article
  if (article) {
    articleForm.value = {
      ...article,
      tagsInput: article.tags?.join(', ') || '',
      generateAISummary: false // 编辑时默认不重新生成
    }
  } else {
    articleForm.value = { title: '', slug: '', summary: '', content: '', tagsInput: '', published: false, generateAISummary: settings.value.ai_available }
  }
  showArticleModal.value = true
}

const saveArticleForm = async () => {
  savingArticle.value = true
  try {
    const data = {
      title: articleForm.value.title,
      slug: articleForm.value.slug,
      summary: articleForm.value.summary,
      content: articleForm.value.content,
      tags: articleForm.value.tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      published: articleForm.value.published,
      generate_ai_summary: articleForm.value.generateAISummary,
      regenerate_ai_summary: editingArticle.value && articleForm.value.generateAISummary
    }

    if (editingArticle.value) {
      await articlesStore.updateArticle(editingArticle.value.id, data)
    } else {
      await articlesStore.createArticle(data)
    }
    showArticleModal.value = false
    await fetchData()
  } catch (err) {
    alert(err.message)
  } finally {
    savingArticle.value = false
  }
}

const confirmDeleteArticle = async (article) => {
  if (confirm(`确定删除文章 "${article.title}" 吗？`)) {
    try {
      await articlesStore.deleteArticle(article.id)
      await fetchData()
    } catch (err) {
      alert(err.message)
    }
  }
}

// 重新生成 AI 总结
const regenerateSummary = async (article) => {
  if (!confirm(`确定要为文章 "${article.title}" 重新生成 AI 总结吗？`)) return
  
  try {
    const res = await fetch(`${API_URL}/api/v1/articles/${article.id}/regenerate-summary`, {
      method: 'POST',
      headers: authStore.getAuthHeaders()
    })
    const data = await res.json()
    if (res.ok) {
      alert('AI 总结已重新生成')
      await fetchData()
    } else {
      alert(data.error || '生成失败')
    }
  } catch (err) {
    alert('生成失败: ' + err.message)
  }
}

// 设置操作
const saveSettings = async () => {
  savingSettings.value = true
  try {
    const res = await fetch(`${API_URL}/api/v1/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authStore.getAuthHeaders()
      },
      body: JSON.stringify(settingsForm.value)
    })
    const data = await res.json()
    if (res.ok) {
      alert('设置已保存')
      settings.value.ai_available = data.data?.ai_available || false
      settingsForm.value.gemini_api_key = ''
      await fetchData()
    } else {
      alert(data.error || '保存失败')
    }
  } catch (err) {
    alert('保存失败: ' + err.message)
  } finally {
    savingSettings.value = false
  }
}

const testAI = async () => {
  testingAI.value = true
  aiTestResult.value = null
  try {
    const res = await fetch(`${API_URL}/api/v1/settings/test-ai`, {
      method: 'POST',
      headers: authStore.getAuthHeaders()
    })
    const data = await res.json()
    if (res.ok) {
      aiTestResult.value = { success: true, message: '✓ AI 服务连接正常！' }
    } else {
      aiTestResult.value = { success: false, message: '✗ ' + (data.error || '连接失败') }
    }
  } catch (err) {
    aiTestResult.value = { success: false, message: '✗ 测试失败: ' + err.message }
  } finally {
    testingAI.value = false
  }
}

// 图片上传回调
const onImageUploaded = (data) => {
  if (!contentTextarea.value) return
  
  const textarea = contentTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = articleForm.value.content
  
  // 在光标位置插入 Markdown 图片
  const before = text.substring(0, start)
  const after = text.substring(end)
  articleForm.value.content = before + data.markdown + '\n' + after
  
  // 聚焦并移动光标
  setTimeout(() => {
    textarea.focus()
    const newPos = start + data.markdown.length + 1
    textarea.setSelectionRange(newPos, newPos)
  }, 0)
}

// 评论操作
const approveComment = async (id) => {
  try {
    await fetch(`${API_URL}/api/v1/comments/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authStore.getAuthHeaders()
      },
      body: JSON.stringify({ approved: true })
    })
    pendingComments.value = pendingComments.value.filter(c => c.id !== id)
    stats.value.pendingComments--
  } catch (err) {
    alert('操作失败')
  }
}

const deleteComment = async (id) => {
  if (confirm('确定删除这条评论吗？')) {
    try {
      await fetch(`${API_URL}/api/v1/comments/${id}`, {
        method: 'DELETE',
        headers: authStore.getAuthHeaders()
      })
      pendingComments.value = pendingComments.value.filter(c => c.id !== id)
      stats.value.pendingComments--
    } catch (err) {
      alert('操作失败')
    }
  }
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/admin')
    return
  }
  fetchData()
})
</script>
