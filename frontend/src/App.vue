<template>
  <div class="min-h-screen gradient-bg theme-transition">
    <!-- 鼠标跟随效果 -->
    <CursorEffect />
    
    <NavHeader />
    <main class="container mx-auto px-4 py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NavHeader from './components/layout/NavHeader.vue'
import Footer from './components/layout/Footer.vue'
import CursorEffect from './components/common/CursorEffect.vue'
import { useThemeStore } from './stores/theme'

// 初始化主题
const themeStore = useThemeStore()

onMounted(() => {
  // 确保主题类被应用
  document.documentElement.classList.add(themeStore.theme)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
