<template>
  <div v-if="article">
    <!-- 文章头部 -->
    <header class="mb-8">
      <router-link to="/blog" class="text-primary-400 hover:text-primary-300 text-sm mb-4 inline-flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        返回文章列表
      </router-link>
      <h1 class="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">{{ article.title }}</h1>
      <div class="flex flex-wrap items-center gap-4 text-sm text-dark-400">
        <span>{{ formatDate(article.created_at) }}</span>
        <span>•</span>
        <span>{{ article.view_count || 0 }} 阅读</span>
        <div v-if="article.tags?.length" class="flex gap-2">
          <span 
            v-for="tag in article.tags" 
            :key="tag"
            class="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </header>

    <!-- AI 总结 -->
    <AISummary v-if="article.ai_summary" :summary="article.ai_summary" />

    <!-- 文章内容 -->
    <article class="markdown-content prose prose-invert max-w-none" v-html="renderedContent"></article>

    <!-- 分隔线 -->
    <hr class="border-dark-700 my-12" />

    <!-- 评论区 -->
    <section>
      <h2 class="text-2xl font-bold text-white mb-8">💬 评论 ({{ comments.length }})</h2>

      <!-- 发表评论 -->
      <form @submit.prevent="submitComment" class="bg-dark-800/50 border border-dark-700 rounded-xl p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input 
            v-model="commentForm.nickname"
            type="text"
            placeholder="昵称"
            required
            class="bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
          <input 
            v-model="commentForm.email"
            type="email"
            placeholder="邮箱（选填）"
            class="bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>
        <textarea 
          v-model="commentForm.content"
          placeholder="写下你的评论..."
          rows="4"
          required
          class="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none transition-colors resize-none mb-4"
        ></textarea>
        <button 
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {{ isSubmitting ? '提交中...' : '发表评论' }}
        </button>
      </form>

      <!-- 评论列表 -->
      <div v-if="comments.length > 0" class="space-y-4">
        <div 
          v-for="comment in comments" 
          :key="comment.id"
          class="bg-dark-800/30 border border-dark-700 rounded-xl p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-white">{{ comment.nickname }}</span>
            <span class="text-dark-500 text-sm">{{ formatDate(comment.created_at) }}</span>
          </div>
          <p class="text-dark-300">{{ comment.content }}</p>
        </div>
      </div>

      <div v-else class="text-center py-8 text-dark-400">
        暂无评论，来说两句吧 ~
      </div>
    </section>
  </div>

  <!-- 加载状态 -->
  <div v-else class="text-center py-20">
    <div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
    <p class="text-dark-400">加载中...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import AISummary from '../components/blog/AISummary.vue'

const route = useRoute()
const API_URL = import.meta.env.VITE_API_URL || ''

const article = ref(null)
const comments = ref([])
const isSubmitting = ref(false)

const commentForm = ref({
  nickname: '',
  email: '',
  content: ''
})

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return marked(article.value.content)
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const submitComment = async () => {
  if (!commentForm.value.nickname || !commentForm.value.content) return
  
  isSubmitting.value = true
  try {
    const res = await fetch(`${API_URL}/api/v1/articles/${article.value.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentForm.value)
    })
    
    const data = await res.json()
    
    if (res.ok) {
      // 显示成功提示
      alert(data.message || '评论已提交，等待审核')
      // 清空表单
      commentForm.value = { nickname: '', email: '', content: '' }
    } else {
      alert(data.error || '提交失败')
    }
  } catch (err) {
    console.error('提交评论失败:', err)
    alert('提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const fetchArticle = async () => {
  const slug = route.params.slug
  
  try {
    const res = await fetch(`${API_URL}/api/v1/articles/${slug}`)
    const data = await res.json()
    
    if (res.ok && data.success) {
      article.value = data.data
      // 获取评论
      fetchComments()
    } else {
      // 使用模拟数据（用于演示）
      article.value = {
        id: 1,
        slug,
        title: '欢迎来到导航页',
        content: `# 欢迎！

这是一个示例文章，展示 Markdown 渲染效果。

## 功能特点

- 支持 **Markdown** 格式
- 代码高亮显示
- 响应式设计
- AI 智能总结

## 代码示例

\`\`\`javascript
console.log('Hello, World!')
\`\`\`

## 图片示例

支持在文章中插入图片，图片会自动压缩优化。

感谢访问！
`,
        summary: '导航页项目介绍与使用说明',
        ai_summary: '这是一篇关于导航页项目的介绍文章，主要展示了 Markdown 渲染功能，包括标题、列表、代码块等基本语法的支持，以及图片插入和 AI 智能总结等特色功能。',
        tags: ['公告', '教程'],
        view_count: 42,
        created_at: '2025-12-07T00:00:00Z'
      }
    }
  } catch (err) {
    console.error('获取文章失败:', err)
  }
}

const fetchComments = async () => {
  if (!article.value?.id) return
  
  try {
    const res = await fetch(`${API_URL}/api/v1/articles/${article.value.id}/comments`)
    const data = await res.json()
    
    if (res.ok && data.success) {
      comments.value = data.data
    }
  } catch (err) {
    console.error('获取评论失败:', err)
  }
}

onMounted(() => {
  fetchArticle()
})
</script>
