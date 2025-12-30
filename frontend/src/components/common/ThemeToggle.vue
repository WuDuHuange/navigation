<template>
  <button
    @click="themeStore.toggleTheme()"
    class="relative w-14 h-8 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 overflow-hidden group"
    :class="themeStore.theme === 'dark' ? 'bg-dark-700' : 'bg-sky-200'"
    :title="themeStore.theme === 'dark' ? '切换到日间模式' : '切换到夜间模式'"
  >
    <!-- 背景星星/云朵装饰 -->
    <div class="absolute inset-0 transition-opacity duration-500" :class="themeStore.theme === 'dark' ? 'opacity-100' : 'opacity-0'">
      <span class="absolute w-1 h-1 bg-white rounded-full top-2 left-2 animate-pulse"></span>
      <span class="absolute w-0.5 h-0.5 bg-white rounded-full top-4 left-4 animate-pulse delay-100"></span>
      <span class="absolute w-1 h-1 bg-white rounded-full top-1.5 left-8 animate-pulse delay-200"></span>
    </div>
    <div class="absolute inset-0 transition-opacity duration-500" :class="themeStore.theme === 'light' ? 'opacity-100' : 'opacity-0'">
      <span class="absolute w-2 h-1.5 bg-white rounded-full top-2 left-2 blur-[1px]"></span>
      <span class="absolute w-3 h-2 bg-white rounded-full top-4 left-6 blur-[1px]"></span>
    </div>

    <!-- 太阳/月亮图标 -->
    <div
      class="absolute w-6 h-6 rounded-full top-1 transition-all duration-500 flex items-center justify-center shadow-lg"
      :class="themeStore.theme === 'dark' ? 'left-1 bg-slate-200' : 'left-7 bg-amber-400'"
    >
      <!-- 月亮 -->
      <svg
        v-if="themeStore.theme === 'dark'"
        class="w-4 h-4 text-slate-700"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <!-- 太阳 -->
      <svg
        v-else
        class="w-4 h-4 text-amber-600"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    </div>
  </button>
</template>

<script setup>
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()
</script>
