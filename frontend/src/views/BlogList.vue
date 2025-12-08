<template>
  <div>
    <section class="mb-12">
      <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">📚 博客文章</h1>
      <p class="text-dark-400">
        分享技术心得、项目经验与思考
        <span v-if="total > 0" class="ml-2 text-dark-500">（共 {{ total }} 篇）</span>
      </p>
    </section>

    <!-- 加载中 -->
    <div v-if="loading && articles.length === 0" class="text-center py-20">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-dark-400">加载中...</p>
    </div>

    <!-- 文章列表 -->
    <div v-else-if="articles.length > 0" class="space-y-6">
      <article 
        v-for="article in articles" 
        :key="article.id"
        class="bg-dark-800/50 border border-dark-700 rounded-xl p-6 card-hover group"
      >
        <router-link :to="`/blog/${article.slug}`">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors">
                {{ article.title }}
              </h2>
              <p class="text-dark-400 line-clamp-2 mb-4">{{ article.summary || article.ai_summary }}</p>
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <span class="text-dark-500">{{ formatDate(article.created_at) }}</span>
                <span class="text-dark-600">•</span>
                <span class="text-dark-500">{{ article.view_count || 0 }} 阅读</span>
                <div v-if="article.tags?.length" class="flex gap-2">
                  <span 
                    v-for="tag in article.tags" 
                    :key="tag"
                    class="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-full text-xs"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
            <svg 
              class="w-5 h-5 text-dark-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-300 hidden md:block" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </div>
        </router-link>
      </article>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-20">
      <div class="text-6xl mb-4">📝</div>
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
          'px-4 py-2 rounded-lg transition-all duration-200',
          currentPage <= 1 || loading
            ? 'bg-dark-800/50 text-dark-600 cursor-not-allowed'
            : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
        ]"
      >
        ← 上一页
      </button>

      <!-- 页码 -->
      <div class="flex gap-1">
        <template v-for="p in visiblePages" :key="p">
          <span v-if="p === '...'" class="w-10 h-10 flex items-center justify-center text-dark-500">...</span>
          <button
            v-else
            @click="goPage(p)"
            :disabled="loading"
            :class="[
              'w-10 h-10 rounded-lg transition-all duration-200',
              currentPage === p
                ? 'bg-primary-500 text-white'
                : loading
                  ? 'bg-dark-800/50 text-dark-600 cursor-not-allowed'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
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
          'px-4 py-2 rounded-lg transition-all duration-200',
          currentPage >= totalPages || loading
            ? 'bg-dark-800/50 text-dark-600 cursor-not-allowed'
            : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
        ]"
      >
        下一页 →
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
