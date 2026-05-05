<template>
  <div class="content-left">
    <!-- Hero 区域 -->
    <section class="text-center py-12 md:py-20 relative">
      <h1 class="text-4xl md:text-5xl font-bold mb-6 animate-fadeInUp text-ink-800">
        我的项目导航
      </h1>
      <p class="text-ink-400 text-lg max-w-xl mx-auto mb-8 animate-fadeInUp stagger-1 opacity-0" style="animation-fill-mode: forwards">
        集中展示个人项目与工具，快速访问常用链接
      </p>
      <div class="flex items-center justify-center gap-4 text-sm animate-fadeInUp stagger-2 opacity-0" style="animation-fill-mode: forwards">
        <span class="flex items-center gap-2 px-4 py-2 bg-white border border-paper-400 rounded-sm text-ink-500">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          所有服务正常运行
        </span>
      </div>
    </section>

    <!-- 导航卡片 -->
    <section class="min-h-[clamp(22rem,50vh,40rem)]">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-ink-800 flex items-center gap-3">
          <span class="seal-icon">入</span>
          <span>项目入口</span>
        </h2>
        <div class="flex items-center gap-2">
          <button
            @click="switchSort('')"
            :class="['px-4 py-2 text-sm font-medium transition-all duration-200 rounded-sm border',
              currentSort === '' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-ink-600 border-paper-400 hover:border-primary-500 hover:text-primary-500']"
          >
            默认
          </button>
          <button
            @click="switchSort('hot')"
            :class="['px-4 py-2 text-sm font-medium transition-all duration-200 rounded-sm border',
              currentSort === 'hot' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-ink-600 border-paper-400 hover:border-primary-500 hover:text-primary-500']"
          >
            热门
          </button>
          <span class="tag ml-2">
            {{ linksStore.links.length }} 个项目
          </span>
        </div>
      </div>
      <LinkGrid :links="linksStore.links" :loading="linksStore.loading" />
    </section>

    <!-- 最新文章预览 -->
    <section v-if="recentArticles.length > 0" class="mt-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-ink-800 flex items-center gap-3">
          <span class="seal-icon">文</span>
          <span>最新动态</span>
        </h2>
        <router-link 
          to="/blog" 
          class="group flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm transition-colors"
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
          class="card p-6 animate-fadeInUp opacity-0"
          :style="{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }"
        >
          <router-link :to="`/blog/${article.slug}`" class="block group">
            <h3 class="text-lg font-semibold text-ink-800 mb-3 group-hover:text-primary-500 transition-colors line-clamp-1">
              {{ article.title }}
            </h3>
            <p class="text-ink-400 text-sm line-clamp-2 mb-4 leading-relaxed">{{ article.summary }}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 text-xs text-ink-400">
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
                  class="tag text-xs"
                >
                  {{ tag }}
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

const linksStore = useLinksStore()
const articlesStore = useArticlesStore()
const recentArticles = computed(() => articlesStore.articles.slice(0, 2))
const currentSort = ref('')

const switchSort = async (sort) => {
  currentSort.value = sort
  await linksStore.fetchLinks(sort)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  await linksStore.fetchLinks()
  await articlesStore.fetchArticles(1)
})
</script>
