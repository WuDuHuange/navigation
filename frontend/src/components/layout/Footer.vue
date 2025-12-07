<template>
  <footer class="border-t border-dark-700 mt-16 py-8">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-dark-400 text-sm">
          © {{ currentYear }} 导航页. 使用 Vue + Tailwind 构建
        </p>
        <div class="flex items-center gap-4">
          <a 
            href="https://vercel.com" 
            target="_blank" 
            rel="noopener"
            class="text-dark-400 hover:text-primary-400 text-sm transition-colors"
          >
            Deployed on Vercel
          </a>
          <span class="text-dark-600">•</span>
          <a 
            href="https://render.com" 
            target="_blank" 
            rel="noopener"
            class="text-dark-400 hover:text-primary-400 text-sm transition-colors"
          >
            API on Render
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
