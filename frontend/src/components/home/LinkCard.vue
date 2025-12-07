<template>
  <a 
    :href="link.url" 
    target="_blank" 
    rel="noopener"
    class="card-hover glow block bg-dark-800/50 border border-dark-700 rounded-xl p-6 group"
  >
    <!-- 图标 -->
    <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
      {{ link.icon || '🔗' }}
    </div>

    <!-- 标题 -->
    <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
      {{ link.title }}
    </h3>

    <!-- 描述 -->
    <p class="text-dark-400 text-sm line-clamp-2">
      {{ link.description }}
    </p>

    <!-- 分类标签 -->
    <div class="mt-4 flex items-center justify-between">
      <span class="px-2 py-1 bg-primary-500/10 text-primary-400 text-xs rounded-full">
        {{ link.category || '默认' }}
      </span>
      <svg 
        class="w-4 h-4 text-dark-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-300" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
      </svg>
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
</script>
