<template>
  <div class="min-h-screen main-bg">
    <NavHeader />
    <main class="container mx-auto px-4 py-8 relative z-10">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
    <!-- 阴阳玉粒子背景 -->
    <YinYangParticles />
    <!-- 弹幕美学特效 -->
    <DanmakuEffects />
  </div>
</template>

<script setup>
import NavHeader from './components/layout/NavHeader.vue'
import Footer from './components/layout/Footer.vue'
import YinYangParticles from './components/common/YinYangParticles.vue'
import DanmakuEffects from './components/common/DanmakuEffects.vue'
</script>

<style scoped>
/* 页面切换过渡动画 */
.page-enter-active {
  transition: all 0.3s ease-out;
}

.page-leave-active {
  transition: all 0.2s ease-in;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 背景网格图案 */
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}
</style>
