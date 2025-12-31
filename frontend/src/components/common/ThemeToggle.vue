<template>
  <button
    @click="handleToggle"
    class="relative w-16 h-9 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 overflow-hidden group"
    :class="themeStore.theme === 'dark' ? 'bg-slate-800 shadow-inner' : 'bg-gradient-to-r from-sky-200 to-blue-200'"
    :title="themeStore.theme === 'dark' ? '切换到日间模式' : '切换到夜间模式'"
  >
    <!-- 夜间背景 - 星星 -->
    <div class="absolute inset-0 transition-all duration-500" :class="themeStore.theme === 'dark' ? 'opacity-100' : 'opacity-0'">
      <span class="absolute w-1 h-1 bg-white rounded-full top-2 left-2 animate-pulse"></span>
      <span class="absolute w-0.5 h-0.5 bg-white/80 rounded-full top-3 left-5 animate-pulse" style="animation-delay: 0.3s"></span>
      <span class="absolute w-1 h-1 bg-white rounded-full top-1.5 left-9 animate-pulse" style="animation-delay: 0.5s"></span>
      <span class="absolute w-0.5 h-0.5 bg-white/60 rounded-full top-5 left-3 animate-pulse" style="animation-delay: 0.7s"></span>
      <span class="absolute w-0.5 h-0.5 bg-white/70 rounded-full top-6 left-7 animate-pulse" style="animation-delay: 0.2s"></span>
    </div>
    
    <!-- 日间背景 - 云朵 -->
    <div class="absolute inset-0 transition-all duration-500" :class="themeStore.theme === 'light' ? 'opacity-100' : 'opacity-0'">
      <span class="absolute w-3 h-2 bg-white rounded-full top-2 left-2 shadow-sm" style="filter: blur(0.5px)"></span>
      <span class="absolute w-4 h-2.5 bg-white rounded-full top-4 left-7 shadow-sm" style="filter: blur(0.5px)"></span>
      <span class="absolute w-2 h-1.5 bg-white/90 rounded-full top-5 left-3 shadow-sm" style="filter: blur(0.5px)"></span>
    </div>

    <!-- 太阳/月亮切换球 -->
    <div
      class="absolute w-7 h-7 rounded-full top-1 transition-all duration-500 flex items-center justify-center"
      :class="[
        themeStore.theme === 'dark' 
          ? 'left-1 bg-gradient-to-br from-slate-100 to-slate-300 shadow-lg' 
          : 'left-8 bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg shadow-orange-300/50'
      ]"
      :style="{ transform: isAnimating ? 'scale(0.9)' : 'scale(1)' }"
    >
      <!-- 月亮 -->
      <svg
        v-if="themeStore.theme === 'dark'"
        class="w-4 h-4 text-slate-600 transition-transform duration-300"
        :class="{ 'rotate-[-20deg]': !isAnimating }"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <!-- 太阳 -->
      <svg
        v-else
        class="w-4 h-4 text-amber-600 transition-transform duration-500"
        :class="{ 'rotate-180': isAnimating }"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    
    <!-- 悬浮光晕效果 -->
    <div 
      class="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      :class="themeStore.theme === 'dark' ? 'bg-primary-500/10' : 'bg-amber-400/20'"
    ></div>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()
const isAnimating = ref(false)

const handleToggle = () => {
  isAnimating.value = true
  setTimeout(() => {
    themeStore.toggleTheme()
    setTimeout(() => {
      isAnimating.value = false
    }, 150)
  }, 100)
}
</script>
