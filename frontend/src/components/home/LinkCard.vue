<template>
  <a 
    :href="link.url" 
    target="_blank" 
    rel="noopener"
    class="card-hover glow block glass-card rounded-2xl p-6 group relative overflow-hidden"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    ref="cardRef"
  >
    <!-- 动态光效背景 -->
    <div 
      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      :style="glowStyle"
    ></div>
    
    <!-- 顶部装饰条 -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400/0 via-primary-500 to-primary-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

    <!-- 图标 -->
    <div class="relative text-4xl mb-4 w-14 h-14 flex items-center justify-center rounded-xl bg-dark-700/50 group-hover:bg-primary-500/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
      <span class="group-hover:animate-bounce-subtle">{{ link.icon || '🔗' }}</span>
    </div>

    <!-- 标题 -->
    <h3 class="relative text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors duration-300">
      {{ link.title }}
    </h3>

    <!-- 描述 -->
    <p class="relative text-dark-400 text-sm line-clamp-2 leading-relaxed">
      {{ link.description }}
    </p>

    <!-- 分类标签和箭头 -->
    <div class="relative mt-4 flex items-center justify-between">
      <span class="px-3 py-1.5 bg-primary-500/10 text-primary-400 text-xs rounded-full font-medium border border-primary-500/20 group-hover:bg-primary-500/20 group-hover:border-primary-500/30 transition-all duration-300">
        {{ link.category || '默认' }}
      </span>
      <div class="flex items-center gap-1 text-dark-500 group-hover:text-primary-400 transition-all duration-300">
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
import { ref, reactive } from 'vue'

defineProps({
  link: {
    type: Object,
    required: true
  }
})

const cardRef = ref(null)
const mousePos = reactive({ x: 50, y: 50 })

const glowStyle = ref({
  background: 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.15), transparent 60%)'
})

const handleMouseMove = (e) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  mousePos.x = x
  mousePos.y = y
  glowStyle.value = {
    background: `radial-gradient(circle at ${x}% ${y}%, rgba(249, 115, 22, 0.2), transparent 50%)`
  }
}

const handleMouseLeave = () => {
  glowStyle.value = {
    background: 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.15), transparent 60%)'
  }
}
</script>
