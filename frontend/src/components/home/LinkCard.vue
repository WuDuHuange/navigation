<template>
  <a 
    :href="link.url" 
    target="_blank" 
    rel="noopener"
    class="card card-tilt block p-5 group"
    ref="cardRef"
    @mouseenter="startTilt"
    @mousemove="updateTilt"
    @mouseleave="resetTilt"
  >
    <!-- 符卡发光层 -->
    <div class="absolute inset-0 rounded-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style="background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(217, 51, 63, 0.15) 0%, transparent 60%);">
    </div>

    <!-- 印章风格图标 -->
    <div class="seal-icon-lg mb-4 group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all duration-300 relative z-10 group-hover:shadow-[0_0_20px_rgba(217,51,63,0.5)]">
      {{ getCategoryIcon(link.category) }}
    </div>

    <!-- 标题 -->
    <h3 class="text-base font-semibold text-ink-800 mb-2 group-hover:text-primary-500 transition-colors duration-300 relative z-10">
      {{ link.title }}
    </h3>

    <!-- 描述 -->
    <p class="text-ink-400 text-sm line-clamp-2 leading-relaxed mb-4 relative z-10">
      {{ link.description }}
    </p>

    <!-- 分类标签和箭头 -->
    <div class="flex items-center justify-between relative z-10">
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
import { ref } from 'vue'

defineProps({
  link: {
    type: Object,
    required: true
  }
})

const cardRef = ref(null)

// 3D 倾斜效果
const startTilt = (e) => {
  if (!cardRef.value) return
  cardRef.value.style.transition = 'transform 0.1s ease-out'
}

const updateTilt = (e) => {
  if (!cardRef.value) return
  
  const rect = cardRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  // 计算倾斜角度
  const rotateX = (y - centerY) / centerY * -8
  const rotateY = (x - centerX) / centerX * 8
  
  // 更新鼠标位置用于发光效果
  const percentX = (x / rect.width) * 100
  const percentY = (y / rect.height) * 100
  
  cardRef.value.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
  cardRef.value.style.setProperty('--mouse-x', `${percentX}%`)
  cardRef.value.style.setProperty('--mouse-y', `${percentY}%`)
}

const resetTilt = (e) => {
  if (!cardRef.value) return
  cardRef.value.style.transition = 'transform 0.5s ease-out'
  cardRef.value.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)'
}

// 根据分类返回汉字印章图标
const getCategoryIcon = (category) => {
  const icons = {
    '游戏': '游',
    '工具': '工',
    '社交': '社',
    '学习': '学',
    '娱乐': '乐',
    '娱乐工具': '趣',
    '资源': '资',
    '开发': '码',
    '设计': '艺',
    '音乐': '乐',
    '视频': '影',
    '阅读': '读',
    '生活': '活',
    '购物': '购',
    '新闻': '闻',
    '默认': '链'
  }
  return icons[category] || icons['默认']
}
</script>

<style scoped>
.card-tilt {
  position: relative;
  overflow: hidden;
}
</style>
