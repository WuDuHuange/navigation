<template>
  <div>
    <!-- Hero 区域 -->
    <section class="text-center py-16 md:py-24 relative">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-10 left-1/4 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-10 right-1/4 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
      </div>
      
      <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp">
        <span class="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
          我的项目导航
        </span>
      </h1>
      <p class="text-dark-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fadeInUp stagger-1 opacity-0" style="animation-fill-mode: forwards">
        集中展示个人项目与工具，快速访问常用链接
      </p>
      <div class="flex items-center justify-center gap-4 text-sm text-dark-500 animate-fadeInUp stagger-2 opacity-0" style="animation-fill-mode: forwards">
        <span class="flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/50 border border-dark-700/50 backdrop-blur-sm">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          所有服务正常运行
        </span>
      </div>
    </section>

    <!-- 导航卡片 -->
    <section>
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-white flex items-center gap-3">
          <span class="text-3xl">🚀</span>
          <span class="bg-gradient-to-r from-white to-dark-300 bg-clip-text text-transparent">项目入口</span>
        </h2>
        <span class="px-3 py-1.5 bg-dark-800/50 border border-dark-700/50 rounded-full text-dark-400 text-sm backdrop-blur-sm">
          {{ linksStore.links.length }} 个项目
        </span>
      </div>
      <LinkGrid :links="linksStore.links" />
    </section>

    <!-- 最新文章预览（可选） -->
    <section v-if="recentArticles.length > 0" class="mt-20">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-white flex items-center gap-3">
          <span class="text-3xl">📝</span>
          <span class="bg-gradient-to-r from-white to-dark-300 bg-clip-text text-transparent">最新动态</span>
        </h2>
        <router-link 
          to="/blog" 
          class="group flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm transition-colors"
        >
          <span>查看全部</span>
          <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </router-link>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article 
          v-for="(article, index) in recentArticles" 
          :key="article.id"
          class="glass-card rounded-2xl p-6 card-hover group animate-fadeInUp opacity-0"
          :style="{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }"
        >
          <router-link :to="`/blog/${article.slug}`" class="block">
            <h3 class="text-lg font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors line-clamp-1">
              {{ article.title }}
            </h3>
            <p class="text-dark-400 text-sm line-clamp-2 mb-4 leading-relaxed">{{ article.summary }}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 text-xs text-dark-500">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ formatDate(article.created_at) }}
                </span>
              </div>
              <div v-if="article.tags?.length" class="flex gap-2">
                <span 
                  v-for="tag in article.tags?.slice(0, 2)" 
                  :key="tag" 
                  class="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-full text-xs border border-primary-500/20"
                >
                  #{{ tag }}
                </span>
              </div>
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
