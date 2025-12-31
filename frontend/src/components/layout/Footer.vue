<template>
  <footer class="relative border-t border-dark-700/50 mt-16 py-8 theme-transition">
    <!-- 顶部渐变线 -->
    <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"></div>
    
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <!-- 左侧版权信息 -->
        <div class="flex items-center gap-3">
          <span class="text-2xl">🧭</span>
          <div>
            <p class="text-dark-400 text-sm font-medium">
              © {{ currentYear }} 导航页
            </p>
            <p class="text-dark-500 text-xs">
              使用 Vue + Tailwind CSS 构建
            </p>
          </div>
        </div>
        
        <!-- 右侧链接 -->
        <div class="flex items-center gap-6">
          <a 
            href="https://vercel.com" 
            target="_blank" 
            rel="noopener"
            class="group flex items-center gap-2 text-dark-400 hover:text-primary-400 text-sm transition-all duration-300"
          >
            <svg class="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19.5h20L12 2z"/>
            </svg>
            <span>Vercel</span>
          </a>
          <span class="text-dark-700">•</span>
          <a 
            href="https://render.com" 
            target="_blank" 
            rel="noopener"
            class="group flex items-center gap-2 text-dark-400 hover:text-primary-400 text-sm transition-all duration-300"
          >
            <svg class="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span>Render</span>
          </a>
        </div>
      </div>
      
      <!-- 底部装饰 -->
      <div class="mt-6 pt-4 border-t border-dark-800/50 flex justify-center">
        <p class="text-dark-600 text-xs flex items-center gap-2">
          Made with <span class="text-red-400 animate-pulse">❤</span> by Developer
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
