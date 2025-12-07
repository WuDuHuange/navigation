<template>
  <div>
    <section class="mb-12">
      <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">📚 博客文章</h1>
      <p class="text-dark-400">分享技术心得、项目经验与思考</p>
    </section>

    <!-- 文章列表 -->
    <div v-if="articles.length > 0" class="space-y-6">
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
              <p class="text-dark-400 line-clamp-2 mb-4">{{ article.summary }}</p>
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
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-12">
      <button
        v-for="p in totalPages"
        :key="p"
        @click="currentPage = p"
        :class="[
          'w-10 h-10 rounded-lg transition-all duration-200',
          currentPage === p
            ? 'bg-primary-500 text-white'
            : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
        ]"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const articles = ref([])
const currentPage = ref(1)
const totalPages = ref(1)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  // TODO: 从 API 获取文章列表
  // const res = await fetch(`/api/v1/articles?page=${currentPage.value}`)
  // const data = await res.json()
  // articles.value = data.data
  // totalPages.value = data.totalPages
})
</script>
