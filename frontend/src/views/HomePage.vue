<template>
  <div>
    <!-- Hero 区域 -->
    <section class="text-center py-16 md:py-24">
      <h1 class="text-4xl md:text-6xl font-bold mb-6">
        <span class="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
          我的项目导航
        </span>
      </h1>
      <p class="text-dark-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
        集中展示个人项目与工具，快速访问常用链接
      </p>
      <div class="flex items-center justify-center gap-4 text-sm text-dark-500">
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          所有服务正常运行
        </span>
      </div>
    </section>

    <!-- 导航卡片 -->
    <section>
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-white">🚀 项目入口</h2>
        <span class="text-dark-500 text-sm">{{ linksStore.links.length }} 个项目</span>
      </div>
      <LinkGrid :links="linksStore.links" />
    </section>

    <!-- 最新文章预览（可选） -->
    <section v-if="recentArticles.length > 0" class="mt-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-white">📝 最新动态</h2>
        <router-link to="/blog" class="text-primary-400 hover:text-primary-300 text-sm">
          查看全部 →
        </router-link>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article 
          v-for="article in recentArticles" 
          :key="article.id"
          class="bg-dark-800/50 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors"
        >
          <router-link :to="`/blog/${article.slug}`">
            <h3 class="text-lg font-semibold text-white mb-2 hover:text-primary-400 transition-colors">
              {{ article.title }}
            </h3>
            <p class="text-dark-400 text-sm line-clamp-2 mb-4">{{ article.summary }}</p>
            <div class="flex items-center gap-2 text-xs text-dark-500">
              <span>{{ formatDate(article.created_at) }}</span>
              <span v-if="article.tags?.length">•</span>
              <span v-for="tag in article.tags?.slice(0, 2)" :key="tag" class="text-primary-400">
                #{{ tag }}
              </span>
            </div>
          </router-link>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import LinkGrid from '../components/home/LinkGrid.vue'
import { useLinksStore } from '../stores/links'
import { useArticlesStore } from '../stores/articles'

// 使用 Pinia store 获取导航链接
const linksStore = useLinksStore()

// 文章 store，用于拉取最新文章
const articlesStore = useArticlesStore()
const recentArticles = computed(() => articlesStore.articles.slice(0, 2))

// 日期格式化
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  await linksStore.fetchLinks()
  // 拉取第一页文章，供首页预览使用（取最新两条）
  await articlesStore.fetchArticles(1)
})
</script>
