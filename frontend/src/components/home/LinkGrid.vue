<template>
  <div>
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

    <!-- 卡片网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <LinkCard 
        v-for="link in filteredLinks" 
        :key="link.id" 
        :link="link" 
      />
    </div>

    <!-- 空状态 -->
    <div v-if="filteredLinks.length === 0" class="text-center py-16">
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
  }
})

const activeCategory = ref(null)

const categories = computed(() => {
  const cats = [...new Set(props.links.map(l => l.category).filter(Boolean))]
  return cats.sort()
})

const filteredLinks = computed(() => {
  if (!activeCategory.value) return props.links
  return props.links.filter(l => l.category === activeCategory.value)
})
</script>
