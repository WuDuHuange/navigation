<template>
  <div>
    <!-- 顶部栏 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-ink-900">管理后台</h1>
        <p class="text-ink-500 mt-1">欢迎回来，{{ authStore.admin?.username }}</p>
      </div>
      <button
        @click="handleLogout"
        class="btn-secondary"
      >
        退出登录
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="card p-6">
        <div class="seal-icon-lg mb-3">链</div>
        <div class="text-2xl font-bold text-ink-900">{{ stats.links }}</div>
        <div class="text-ink-500 text-sm">导航链接</div>
      </div>
      <div class="card p-6">
        <div class="seal-icon-lg mb-3">文</div>
        <div class="text-2xl font-bold text-ink-900">{{ stats.articles }}</div>
        <div class="text-ink-500 text-sm">文章数量</div>
      </div>
      <div class="card p-6">
        <div class="seal-icon-lg mb-3">评</div>
        <div class="text-2xl font-bold text-ink-900">{{ stats.comments }}</div>
        <div class="text-ink-500 text-sm">总评论数</div>
      </div>
      <div class="card p-6">
        <div class="seal-icon-lg mb-3">智</div>
        <div class="text-2xl font-bold" :class="settings.ai_available ? 'text-green-600' : 'text-ink-400'">
          {{ settings.ai_available ? '已连接' : '未配置' }}
        </div>
        <div class="text-ink-500 text-sm">AI 服务</div>
      </div>
    </div>

    <!-- Tab 导航 -->
    <div class="flex border-b border-ink-200 mb-6 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-6 py-3 font-medium transition-colors relative whitespace-nowrap',
          activeTab === tab.id
            ? 'text-primary-500'
            : 'text-ink-500 hover:text-ink-900'
        ]"
      >
        <span class="seal-icon mr-2">{{ tab.icon }}</span>{{ tab.name }}
        <span
          v-if="activeTab === tab.id"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
        ></span>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="card p-6">
      <!-- 导航链接管理 -->
      <div v-if="activeTab === 'links'">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-ink-900">导航链接列表</h2>
          <button
            @click="openLinkModal()"
            class="btn-primary"
          >
            + 添加链接
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-ink-500 text-sm border-b border-ink-200">
                <th class="pb-3 pr-4">图标</th>
                <th class="pb-3 pr-4">标题</th>
                <th class="pb-3 pr-4">链接</th>
                <th class="pb-3 pr-4">分类</th>
                <th class="pb-3 pr-4">排序</th>
                <th class="pb-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="link in links" :key="link.id" class="border-b border-ink-100">
                <td class="py-4 pr-4 text-2xl">{{ link.icon }}</td>
                <td class="py-4 pr-4 text-ink-900">{{ link.title }}</td>
                <td class="py-4 pr-4">
                  <a :href="link.url" target="_blank" class="text-primary-500 hover:underline text-sm truncate block max-w-[200px]">
                    {{ link.url }}
                  </a>
                </td>
                <td class="py-4 pr-4">
                  <span class="tag">{{ link.category }}</span>
                </td>
                <td class="py-4 pr-4 text-ink-500">{{ link.sort_order }}</td>
                <td class="py-4">
                  <div class="flex gap-2">
                    <button @click="openLinkModal(link)" class="seal-icon text-ink-500 hover:text-primary-500">编</button>
                    <button @click="confirmDeleteLink(link)" class="seal-icon text-ink-500 hover:text-red-500">删</button>
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
          <h2 class="text-lg font-semibold text-ink-900">文章列表</h2>
          <button
            @click="openArticleModal()"
            class="btn-primary"
          >
            + 发布文章
          </button>
        </div>

        <div v-if="articles.length === 0" class="text-center py-12 text-ink-500">
          暂无文章，点击上方按钮发布第一篇
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="article in articles"
            :key="article.id"
            class="flex items-center justify-between p-4 bg-paper-100 rounded-sm border border-ink-100"
          >
            <div class="flex-1">
              <h3 class="text-ink-900 font-medium">{{ article.title }}</h3>
              <div class="flex flex-wrap items-center gap-3 mt-1 text-sm text-ink-500">
                <span>{{ formatDate(article.created_at) }}</span>
                <span>{{ article.view_count || 0 }} 阅读</span>
                <span :class="article.published ? 'text-green-600' : 'text-yellow-600'">
                  {{ article.published ? '已发布' : '草稿' }}
                </span>
                <span v-if="article.ai_summary" class="text-primary-500">
                  <span class="seal-icon text-xs">智</span> 已生成总结
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                v-if="settings.ai_available"
                @click="regenerateSummary(article)" 
                class="seal-icon text-ink-500 hover:text-primary-500"
                title="重新生成 AI 总结"
              >智</button>
              <button @click="openArticleModal(article)" class="seal-icon text-ink-500 hover:text-primary-500">编</button>
              <button @click="confirmDeleteArticle(article)" class="seal-icon text-ink-500 hover:text-red-500">删</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论管理 -->
      <div v-if="activeTab === 'comments'">
        <h2 class="text-lg font-semibold text-ink-900 mb-6">待审核评论</h2>
        
        <div v-if="pendingComments.length === 0" class="text-center py-12 text-ink-500">
          <span class="seal-icon-lg mb-3">空</span>
          <p>暂无待审核评论</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="comment in pendingComments"
            :key="comment.id"
            class="p-4 bg-paper-100 rounded-sm border border-ink-100"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-medium text-ink-900">{{ comment.nickname }}</span>
                  <span class="text-ink-400 text-sm">{{ comment.email }}</span>
                </div>
                <p class="text-ink-700 mb-2">{{ comment.content }}</p>
                <div class="text-xs text-ink-400">
                  文章：{{ comment.article_title }} · {{ formatDate(comment.created_at) }}
                </div>
              </div>
              <div class="flex gap-2 ml-4">
                <button
                  @click="approveComment(comment.id)"
                  class="px-3 py-1 bg-green-100 text-green-700 rounded-sm hover:bg-green-200 transition-colors text-sm"
                >
                  通过
                </button>
                <button
                  @click="deleteComment(comment.id)"
                  class="px-3 py-1 bg-red-100 text-red-700 rounded-sm hover:bg-red-200 transition-colors text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统设置 -->
      <div v-if="activeTab === 'settings'">
        <h2 class="text-lg font-semibold text-ink-900 mb-6">系统设置</h2>
        
        <div class="space-y-6 max-w-xl">
          <!-- Gemini API Key -->
          <div class="bg-paper-100 rounded-sm p-4 border border-ink-100">
            <label class="block text-sm font-medium text-ink-700 mb-2">
              <span class="seal-icon mr-1">智</span> Gemini API Key
              <span class="text-ink-400 font-normal ml-2">用于生成文章 AI 总结</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="settingsForm.gemini_api_key"
                type="password"
                placeholder="输入你的 Gemini API Key"
                class="flex-1 bg-white border border-ink-200 rounded-sm px-3 py-2 text-ink-900 placeholder-ink-400 focus:border-primary-500 focus:outline-none"
              />
              <button
                @click="saveSettings"
                :disabled="savingSettings"
                class="btn-primary"
              >
                {{ savingSettings ? '保存中...' : '保存' }}
              </button>
            </div>
            <!-- 保存结果提示 -->
            <p v-if="settingsSaveResult" class="text-sm mt-2" :class="settingsSaveResult.success ? 'text-green-600' : 'text-red-600'">
              {{ settingsSaveResult.message }}
            </p>
            <p class="text-xs text-ink-400 mt-2">
              当前状态：
              <span :class="settings.ai_available ? 'text-green-600' : 'text-red-600'">
                {{ settings.ai_available ? '已配置' : '未配置' }}
              </span>
            </p>
            <p class="text-xs text-ink-400 mt-1">
              获取 API Key：<a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-primary-500 hover:underline">Google AI Studio</a>
            </p>
          </div>

          <!-- 测试 AI 连接 -->
          <div class="bg-paper-100 rounded-sm p-4 border border-ink-100">
            <label class="block text-sm font-medium text-ink-700 mb-2">测试 AI 连接</label>
            <div class="flex items-center gap-3">
              <button
                @click="testAI"
                :disabled="testingAI"
                class="btn-secondary"
              >
                {{ testingAI ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="!settings.ai_available" class="text-xs text-ink-400">先保存 API Key 后再测试</span>
            </div>
            <p v-if="aiTestResult" class="text-sm mt-2" :class="aiTestResult.success ? 'text-green-600' : 'text-red-600'">
              {{ aiTestResult.message }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 链接编辑弹窗 -->
    <div v-if="showLinkModal" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div class="bg-white border border-ink-200 rounded-sm p-6 w-full max-w-md shadow-lg">
        <h3 class="text-lg font-semibold text-ink-900 mb-4">
          {{ editingLink ? '编辑链接' : '添加链接' }}
        </h3>
        <form @submit.prevent="saveLinkForm" class="space-y-4">
          <div>
            <label class="block text-sm text-ink-600 mb-1">标题 *</label>
            <input v-model="linkForm.title" required class="w-full bg-paper-100 border border-ink-200 rounded-sm px-3 py-2 text-ink-900 focus:border-primary-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-sm text-ink-600 mb-1">链接地址 *</label>
            <input v-model="linkForm.url" required class="w-full bg-paper-100 border border-ink-200 rounded-sm px-3 py-2 text-ink-900 focus:border-primary-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-sm text-ink-600 mb-1">描述</label>
            <input v-model="linkForm.description" class="w-full bg-paper-100 border border-ink-200 rounded-sm px-3 py-2 text-ink-900 focus:border-primary-500 focus:outline-none" />
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-ink-600 mb-1">图标</label>
              <input v-model="linkForm.icon" class="w-full bg-paper-100 border border-ink-200 rounded-sm px-3 py-2 text-ink-900 focus:border-primary-500 focus:outline-none" placeholder="🔗" />
            </div>
            <div>
              <label class="block text-sm text-ink-600 mb-1">分类</label>
              <input v-model="linkForm.category" class="w-full bg-paper-100 border border-ink-200 rounded-sm px-3 py-2 text-ink-900 focus:border-primary-500 focus:outline-none" placeholder="默认" />
            </div>
            <div>
              <label class="block text-sm text-ink-600 mb-1">排序</label>
              <input v-model.number="linkForm.sort_order" type="number" class="w-full bg-paper-100 border border-ink-200 rounded-sm px-3 py-2 text-ink-900 focus:border-primary-500 focus:outline-none" />
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="showLinkModal = false" class="btn-secondary">
              取消
            </button>
            <button type="submit" class="btn-primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 文章编辑弹窗 - 优化版 -->
    <div v-if="showArticleModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white border border-ink-200 rounded-sm w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        <!-- 弹窗头部 -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-ink-200">
          <h3 class="text-lg font-semibold text-ink-900 flex items-center gap-2">
            <span class="seal-icon">{{ editingArticle ? '编' : '文' }}</span>
            <span>{{ editingArticle ? '编辑文章' : '发布新文章' }}</span>
            <span v-if="editingArticle" class="text-xs px-2 py-0.5 rounded-sm" 
              :class="editingArticle.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
              {{ editingArticle.published ? '已发布' : '草稿' }}
            </span>
          </h3>
          <button @click="showArticleModal = false" class="text-ink-400 hover:text-ink-900 text-xl p-1">×</button>
        </div>
        
        <!-- 弹窗内容 -->
        <div class="flex-1 overflow-y-auto p-6">
          <form @submit.prevent="saveArticleForm" class="space-y-5">
            <!-- 标题和 Slug 同行 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-ink-700 mb-1.5">标题 *</label>
                <input v-model="articleForm.title" required 
                  class="w-full bg-paper-100 border border-ink-200 rounded-sm px-4 py-2.5 text-ink-900 focus:border-primary-500 focus:outline-none transition-colors" 
                  placeholder="输入文章标题" />
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-700 mb-1.5">
                  URL 标识 (slug)
                  <span class="text-ink-400 font-normal ml-1">可选</span>
                </label>
                <input v-model="articleForm.slug" 
                  class="w-full bg-paper-100 border border-ink-200 rounded-sm px-4 py-2.5 text-ink-900 focus:border-primary-500 focus:outline-none transition-colors" 
                  placeholder="留空自动根据标题生成" />
              </div>
            </div>
            
            <!-- 摘要和标签同行 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-ink-700 mb-1.5">摘要 <span class="text-ink-400 font-normal">可选</span></label>
                <input v-model="articleForm.summary" 
                  class="w-full bg-paper-100 border border-ink-200 rounded-sm px-4 py-2.5 text-ink-900 focus:border-primary-500 focus:outline-none transition-colors" 
                  placeholder="简短描述文章内容" />
              </div>
              <div>
                <label class="block text-sm font-medium text-ink-700 mb-1.5">标签 <span class="text-ink-400 font-normal">逗号分隔</span></label>
                <input v-model="articleForm.tagsInput" 
                  class="w-full bg-paper-100 border border-ink-200 rounded-sm px-4 py-2.5 text-ink-900 focus:border-primary-500 focus:outline-none transition-colors" 
                  placeholder="公告, 教程, 技术" />
              </div>
            </div>
            
            <!-- 内容编辑器 -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-sm font-medium text-ink-700">
                  内容 *
                  <span class="text-ink-400 font-normal ml-1">支持 Markdown</span>
                </label>
                <ImageUpload @uploaded="onImageUploaded" />
              </div>
              <textarea 
                ref="contentTextarea"
                v-model="articleForm.content" 
                required 
                rows="16" 
                class="w-full bg-paper-100 border border-ink-200 rounded-sm px-4 py-3 text-ink-900 font-mono text-sm resize-none focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="使用 Markdown 格式编写文章内容...&#10;&#10;# 标题&#10;## 子标题&#10;&#10;正文内容...&#10;&#10;```javascript&#10;// 代码块&#10;```"
              ></textarea>
              <p class="text-xs text-ink-400 mt-1">提示：可点击右上角按钮上传图片，自动插入 Markdown 格式</p>
            </div>
            
            <!-- 发布选项 -->
            <div class="flex flex-wrap items-center gap-6 pt-2 pb-4 border-t border-ink-200">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input v-model="articleForm.published" type="checkbox" 
                  class="w-4 h-4 rounded-sm border-ink-300 text-primary-500 focus:ring-primary-500" />
                <span class="text-ink-600 group-hover:text-ink-900 transition-colors">
                  {{ articleForm.published ? '立即发布' : '保存为草稿' }}
                </span>
              </label>
              <label v-if="settings.ai_available" class="flex items-center gap-2 cursor-pointer group">
                <input v-model="articleForm.generateAISummary" type="checkbox" 
                  class="w-4 h-4 rounded-sm border-ink-300 text-primary-500 focus:ring-primary-500" />
                <span class="text-ink-600 group-hover:text-ink-900 transition-colors">
                  <span class="seal-icon text-xs mr-1">智</span>生成 AI 总结
                </span>
              </label>
            </div>
          </form>
        </div>
        
        <!-- 弹窗底部 -->
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-ink-200 bg-paper-100">
          <button type="button" @click="showArticleModal = false" 
            class="btn-secondary">
            取消
          </button>
          <button @click="saveArticleForm" :disabled="savingArticle" 
            class="btn-primary flex items-center gap-2">
            <span v-if="savingArticle" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ savingArticle ? '保存中...' : (articleForm.published ? '发布文章' : '保存草稿') }}
          </button>
        </div>
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
  { id: 'links', name: '导航链接', icon: '链' },
  { id: 'articles', name: '文章管理', icon: '文' },
  { id: 'comments', name: '评论审核', icon: '评' },
  { id: 'settings', name: '系统设置', icon: '设' }
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
const settingsSaveResult = ref(null) // 新增：保存结果提示

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

    // 获取文章（管理员接口，包含草稿）
    const articlesRes = await fetch(`${API_URL}/api/v1/articles/admin/all?limit=50`, {
      headers: authStore.getAuthHeaders()
    })
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
  settingsSaveResult.value = null
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
      settingsSaveResult.value = { success: true, message: '✓ 设置已保存成功！' }
      settings.value.ai_available = data.data?.ai_available || false
      settingsForm.value.gemini_api_key = ''
      await fetchData()
      // 3秒后清除提示
      setTimeout(() => { settingsSaveResult.value = null }, 3000)
    } else {
      settingsSaveResult.value = { success: false, message: '✗ ' + (data.error || '保存失败') }
    }
  } catch (err) {
    settingsSaveResult.value = { success: false, message: '✗ 保存失败: ' + err.message }
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
