<template>
  <div>
    <!-- 搜索框 -->
    <div class="mb-6">
      <div class="relative max-w-md">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索项目名称、描述或链接..."
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-paper-400 rounded-sm text-ink-900 text-sm placeholder-ink-400 focus:border-primary-500 focus:outline-none transition-colors"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
        >×</button>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div v-if="categories.length > 1" class="flex flex-wrap gap-2 mb-8">
      <button
        v-for="cat in ['全部', ...categories]"
        :key="cat"
        @click="activeCategory = cat === '全部' ? null : cat"
        :class="[
          'px-4 py-2 text-sm font-medium transition-all duration-200 rounded-sm border',
          (activeCategory === null && cat === '全部') || activeCategory === cat
            ? 'bg-primary-500 text-white border-primary-500'
            : 'bg-white text-ink-600 border-paper-400 hover:border-primary-500 hover:text-primary-500'
        ]"
      >
        {{ cat }}
      </button>
    </div>

    <!-- 加载占位：根据屏幕高度自适应，避免 footer 上浮 -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 min-h-[clamp(20rem,46vh,34rem)]"
    >
      <div
        v-for="idx in 8"
        :key="`skeleton-${idx}`"
        class="card p-6 animate-pulse"
      >
        <div class="h-6 w-10 rounded-sm bg-paper-300 mb-5"></div>
        <div class="h-5 w-2/3 rounded-sm bg-paper-300 mb-3"></div>
        <div class="h-4 w-full rounded-sm bg-paper-200 mb-2"></div>
        <div class="h-4 w-5/6 rounded-sm bg-paper-200 mb-5"></div>
        <div class="h-4 w-20 rounded-sm bg-paper-300"></div>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div v-else-if="filteredLinks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <LinkCard 
        v-for="link in filteredLinks" 
        :key="link.id" 
        :link="link" 
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center min-h-[clamp(18rem,38vh,28rem)] flex flex-col items-center justify-center">
      <div class="seal-icon-lg mx-auto mb-4">空</div>
      <p class="text-ink-400">暂无导航链接</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import LinkCard from './LinkCard.vue'

const props = defineProps({
  links: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const activeCategory = ref(null)
const searchQuery = ref('')

const categories = computed(() => {
  const cats = [...new Set(props.links.map(l => l.category).filter(Boolean))]
  return cats.sort()
})

const filteredLinks = computed(() => {
  let list = props.links
  if (activeCategory.value) {
    list = list.filter(l => l.category === activeCategory.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(l =>
      (l.title || '').toLowerCase().includes(q) ||
      (l.description || '').toLowerCase().includes(q) ||
      (l.url || '').toLowerCase().includes(q)
    )
  }
  return list
})
</script>
