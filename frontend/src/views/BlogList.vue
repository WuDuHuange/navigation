<template>
  <div>
    <!-- 页面标题区域 -->
    <section class="mb-12 relative">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-10 -left-10 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl"></div>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3 animate-fadeInUp">
        <span class="text-4xl">📚</span>
        <span class="bg-gradient-to-r from-white to-dark-300 bg-clip-text text-transparent">博客文章</span>
      </h1>
      <p class="text-dark-400 animate-fadeInUp stagger-1 opacity-0" style="animation-fill-mode: forwards">
        分享技术心得、项目经验与思考
        <span v-if="total > 0" class="ml-2 px-2 py-0.5 bg-dark-800/50 rounded-full text-dark-500 text-sm">
          共 {{ total }} 篇
        </span>
      </p>
    </section>

    <!-- 加载中 -->
    <div v-if="loading && articles.length === 0" class="text-center py-20">
      <div class="relative inline-block">
        <div class="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        <div class="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-primary-400/50 rounded-full animate-spin" style="animation-duration: 1.5s"></div>
      </div>
      <p class="text-dark-400 mt-4">加载中...</p>
    </div>

    <!-- 文章列表 -->
    <div v-else-if="articles.length > 0" class="space-y-6">
      <article 
        v-for="(article, index) in articles" 
        :key="article.id"
        class="glass-card rounded-2xl p-6 card-hover group animate-fadeInUp opacity-0"
        :style="{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }"
      >
        <router-link :to="`/blog/${article.slug}`">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300">
                {{ article.title }}
              </h2>
              <p class="text-dark-400 line-clamp-2 mb-4 leading-relaxed">{{ article.summary || article.ai_summary }}</p>
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <span class="flex items-center gap-1.5 text-dark-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ formatDate(article.created_at) }}
                </span>
                <span class="text-dark-700">•</span>
                <span class="flex items-center gap-1.5 text-dark-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  {{ article.view_count || 0 }}
                </span>
                <div v-if="article.tags?.length" class="flex gap-2 ml-2">
                  <span 
                    v-for="tag in article.tags" 
                    :key="tag"
                    class="px-2.5 py-0.5 bg-primary-500/10 text-primary-400 rounded-full text-xs border border-primary-500/20 group-hover:bg-primary-500/20 transition-colors"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 text-dark-500 group-hover:text-primary-400 transition-all duration-300 md:mt-2">
              <span class="text-sm opacity-0 group-hover:opacity-100 transition-opacity">阅读</span>
              <svg 
                class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </div>
          </div>
        </router-link>
      </article>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-20">
      <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-800/50 flex items-center justify-center">
        <span class="text-5xl">📝</span>
      </div>
      <h3 class="text-xl font-semibold text-white mb-2">暂无文章</h3>
      <p class="text-dark-400">文章正在准备中，敬请期待...</p>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-12">
      <!-- 上一页 -->
      <button
        @click="goPage(currentPage - 1)"
        :disabled="loading || currentPage <= 1"
        :class="[
          'px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1',
          currentPage <= 1 || loading
            ? 'bg-dark-800/30 text-dark-600 cursor-not-allowed'
            : 'glass-card text-dark-300 hover:text-primary-400 hover:border-primary-500/50'
        ]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        上一页
      </button>

      <!-- 页码 -->
      <div class="flex gap-1.5">
        <template v-for="p in visiblePages" :key="p">
          <span v-if="p === '...'" class="w-10 h-10 flex items-center justify-center text-dark-500">...</span>
          <button
            v-else
            @click="goPage(p)"
            :disabled="loading"
            :class="[
              'w-10 h-10 rounded-xl transition-all duration-300 font-medium',
              currentPage === p
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                : loading
                  ? 'bg-dark-800/30 text-dark-600 cursor-not-allowed'
                  : 'glass-card text-dark-300 hover:text-primary-400 hover:border-primary-500/50'
            ]"
          >
            {{ p }}
          </button>
        </template>
      </div>

      <!-- 下一页 -->
      <button
        @click="goPage(currentPage + 1)"
        :disabled="loading || currentPage >= totalPages"
        :class="[
          'px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1',
          currentPage >= totalPages || loading
            ? 'bg-dark-800/30 text-dark-600 cursor-not-allowed'
            : 'glass-card text-dark-300 hover:text-primary-400 hover:border-primary-500/50'
        ]"
      >
        下一页
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticlesStore } from '../stores/articles'

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()

// 从 URL 查询参数读取初始页码
const currentPage = ref(Number(route.query.page) || 1)

const articles = computed(() => articlesStore.articles)
const loading = computed(() => articlesStore.loading)
const total = computed(() => articlesStore.pagination?.total || 0)
const totalPages = computed(() => articlesStore.pagination?.totalPages || 1)

// 计算可见页码（省略中间页码，只显示首尾和当前附近）
const visiblePages = computed(() => {
  const pages = []
  const tp = totalPages.value
  const cp = currentPage.value

  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('...')
    for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) {
      pages.push(i)
    }
    if (cp < tp - 2) pages.push('...')
    pages.push(tp)
  }
  return pages
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const goPage = async (p) => {
  if (p < 1 || p > totalPages.value || p === currentPage.value || loading.value) return
  currentPage.value = p
}

// 监听页码变化，请求数据并同步 URL
watch(currentPage, async (p) => {
  await articlesStore.fetchArticles(p)
  // 同步 URL 查询参数（不触发页面刷新）
  router.replace({ query: { ...route.query, page: String(p) } }).catch(() => {})
})

// 初次挂载
onMounted(async () => {
  await articlesStore.fetchArticles(currentPage.value)
})
</script>
