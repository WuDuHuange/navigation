<template>
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-dark-900/70 border-b border-dark-700/50 theme-transition">
    <!-- 顶部渐变装饰线 -->
    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-60"></div>
    
    <div class="container mx-auto px-4">
      <nav class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group relative">
          <span class="text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">🧭</span>
          <span class="text-xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent bg-[length:200%_auto] group-hover:animate-gradient-shift">
            导航页
          </span>
          <!-- 悬浮光效 -->
          <div class="absolute -inset-2 bg-primary-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        </router-link>

        <!-- 导航链接 -->
        <div class="flex items-center gap-4 md:gap-6">
          <router-link 
            to="/" 
            class="nav-link relative text-dark-300 hover:text-primary-400 transition-all duration-200 py-2"
            active-class="text-primary-400"
          >
            <span class="relative z-10">首页</span>
            <span class="nav-underline"></span>
          </router-link>
          <router-link 
            to="/blog" 
            class="nav-link relative text-dark-300 hover:text-primary-400 transition-all duration-200 py-2"
            active-class="text-primary-400"
          >
            <span class="relative z-10">博客</span>
            <span class="nav-underline"></span>
          </router-link>
          
          <!-- 主题切换按钮 -->
          <ThemeToggle />
          
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener"
            class="relative p-2 text-dark-300 hover:text-primary-400 transition-all duration-200 rounded-lg hover:bg-primary-500/10"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import ThemeToggle from '../common/ThemeToggle.vue'
</script>

<style scoped>
.nav-link .nav-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #f97316, #fb923c);
  border-radius: 1px;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover .nav-underline,
.nav-link.router-link-active .nav-underline {
  width: 100%;
}
</style>
