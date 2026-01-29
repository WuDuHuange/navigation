<template>
  <a 
    :href="link.url" 
    target="_blank" 
    rel="noopener"
    class="card block p-5 group"
  >
    <!-- 印章风格图标 -->
    <div class="seal-icon-lg mb-4 group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all duration-300">
      {{ getCategoryIcon(link.category) }}
    </div>

    <!-- 标题 -->
    <h3 class="text-base font-semibold text-ink-800 mb-2 group-hover:text-primary-500 transition-colors duration-300">
      {{ link.title }}
    </h3>

    <!-- 描述 -->
    <p class="text-ink-400 text-sm line-clamp-2 leading-relaxed mb-4">
      {{ link.description }}
    </p>

    <!-- 分类标签和箭头 -->
    <div class="flex items-center justify-between">
      <span class="tag">
        {{ link.category || '默认' }}
      </span>
      <div class="flex items-center gap-1 text-ink-400 group-hover:text-primary-500 transition-all duration-300">
        <span class="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">访问</span>
        <svg 
          class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
        </svg>
      </div>
    </div>
  </a>
</template>

<script setup>
defineProps({
  link: {
    type: Object,
    required: true
  }
})

// 根据分类返回汉字印章图标
const getCategoryIcon = (category) => {
  const icons = {
    '游戏': '游',
    '工具': '工',
    '社交': '社',
    '学习': '学',
    '娱乐': '乐',
    '资源': '资',
    '开发': '码',
    '设计': '艺',
    '音乐': '乐',
    '视频': '影',
    '阅读': '读',
    '默认': '链'
  }
  return icons[category] || icons['默认']
}
</script>
