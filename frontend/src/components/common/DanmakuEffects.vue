<template>
  <!-- 鼠标拖尾粒子层 -->
  <div class="pointer-events-none fixed inset-0 z-50 overflow-hidden">
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle absolute rounded-full"
      :style="{
        left: particle.x + 'px',
        top: particle.y + 'px',
        width: particle.size + 'px',
        height: particle.size + 'px',
        backgroundColor: particle.color,
        opacity: particle.opacity,
        transform: `scale(${particle.scale})`,
        boxShadow: `0 0 ${particle.size}px ${particle.color}`
      }"
    />
  </div>

  <!-- 彩蛋特效层 -->
  <Teleport to="body">
    <div v-if="showEasterEgg" class="fixed inset-0 z-[100] pointer-events-none easter-egg-container">
      <!-- 弹幕特效 -->
      <div
        v-for="danmaku in danmakuList"
        :key="danmaku.id"
        class="absolute danmaku-bullet"
        :style="{
          left: danmaku.x + 'px',
          top: danmaku.y + 'px',
          transform: `rotate(${danmaku.angle}deg)`,
          animationDelay: danmaku.delay + 's'
        }"
      >
        <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: danmaku.color, boxShadow: `0 0 10px ${danmaku.color}, 0 0 20px ${danmaku.color}` }"></div>
      </div>
      
      <!-- 中心爆发文字 -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="easter-egg-text text-6xl font-bold text-primary-500" style="text-shadow: 0 0 20px #D9333F, 0 0 40px #D9333F, 0 0 60px #ff6b6b;">
          ✦ 梦想封印 ✦
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 鼠标拖尾粒子
const particles = ref([])
let particleId = 0
let lastX = 0
let lastY = 0
let rafId = null

// 粒子颜色 - 红白主题
const colors = ['#D9333F', '#ff6b6b', '#ffffff', '#fecaca', '#f87171']

const createParticle = (x, y) => {
  const particle = {
    id: particleId++,
    x: x - 4,
    y: y - 4,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 1,
    scale: 1,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
  }
  particles.value.push(particle)
  
  // 限制粒子数量
  if (particles.value.length > 20) {
    particles.value.shift()
  }
}

const updateParticles = () => {
  particles.value = particles.value
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      opacity: p.opacity - 0.03,
      scale: p.scale * 0.96
    }))
    .filter(p => p.opacity > 0)
  
  rafId = requestAnimationFrame(updateParticles)
}

const handleMouseMove = (e) => {
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  const dist = Math.sqrt(dx * dx + dy * dy)
  
  // 只在移动一定距离后创建粒子
  if (dist > 10) {
    createParticle(e.clientX, e.clientY)
    lastX = e.clientX
    lastY = e.clientY
  }
  
  // 更新背景视差
  updateParallax(e.clientX, e.clientY)
}

// 背景视差效果 - 使用 requestAnimationFrame 平滑更新
let parallaxRAF = null
let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0
let targetRotateX = 0
let targetRotateY = 0
let currentRotateX = 0
let currentRotateY = 0

const lerp = (start, end, factor) => start + (end - start) * factor

const updateParallax = (mouseX, mouseY) => {
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  
  // 计算目标值（反向移动）
  const normalizedX = (mouseX - centerX) / centerX
  const normalizedY = (mouseY - centerY) / centerY
  
  // 缩小位移幅度，避免过度移动
  targetX = normalizedX * -20
  targetY = normalizedY * -12
  
  // 3D 透视旋转 - 缩小角度以获得更细腻的立体感
  targetRotateY = normalizedX * 4    // 左右偏转 ±4°
  targetRotateX = normalizedY * -2   // 上下俯仰 ±2°
}

const animateParallax = () => {
  // 使用线性插值平滑过渡（略微提高响应，让感觉更灵活但不突兀）
  currentX = lerp(currentX, targetX, 0.12)
  currentY = lerp(currentY, targetY, 0.12)
  currentRotateX = lerp(currentRotateX, targetRotateX, 0.09)
  currentRotateY = lerp(currentRotateY, targetRotateY, 0.09)
  
  // 更新 CSS 变量
  const root = document.documentElement
  root.style.setProperty('--parallax-x', `${currentX}px`)
  root.style.setProperty('--parallax-y', `${currentY}px`)
  root.style.setProperty('--parallax-rotate-x', `${currentRotateX}deg`)
  root.style.setProperty('--parallax-rotate-y', `${currentRotateY}deg`)
  
  parallaxRAF = requestAnimationFrame(animateParallax)
}

// ===== Konami Code 彩蛋 =====
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
let konamiIndex = 0
const showEasterEgg = ref(false)
const danmakuList = ref([])

const handleKeyDown = (e) => {
  if (e.code === konamiCode[konamiIndex]) {
    konamiIndex++
    if (konamiIndex === konamiCode.length) {
      triggerEasterEgg()
      konamiIndex = 0
    }
  } else {
    konamiIndex = 0
  }
}

const triggerEasterEgg = () => {
  showEasterEgg.value = true
  
  // 创建弹幕
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  const bulletColors = ['#D9333F', '#ff6b6b', '#fecaca', '#ffffff', '#f472b6', '#c084fc']
  
  danmakuList.value = []
  
  // 创建螺旋弹幕
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * 360 * 3
    const radius = 50 + i * 8
    danmakuList.value.push({
      id: i,
      x: centerX + Math.cos(angle * Math.PI / 180) * radius - 8,
      y: centerY + Math.sin(angle * Math.PI / 180) * radius - 8,
      angle: angle,
      color: bulletColors[i % bulletColors.length],
      delay: i * 0.02
    })
  }
  
  // 播放音效（可选）
  // playSound()
  
  // 3秒后隐藏
  setTimeout(() => {
    showEasterEgg.value = false
    danmakuList.value = []
  }, 3000)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('keydown', handleKeyDown)
  updateParticles()
  animateParallax() // 启动视差动画循环

  // 检测 newBG.png 是否存在：若存在则优先使用并在顶部留空
  const img = new Image()
  img.onload = () => {
    document.documentElement.classList.add('has-newbg')
    document.documentElement.style.setProperty('--bg-top-gap', '6vh')
  }
  img.onerror = () => {
    document.documentElement.classList.add('no-newbg')
  }
  // 带时间戳避免被缓存影响检测
  img.src = '/assets/newBG.png?ts=' + Date.now()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('keydown', handleKeyDown)
  if (rafId) cancelAnimationFrame(rafId)
  if (parallaxRAF) cancelAnimationFrame(parallaxRAF)
})
</script>

<style scoped>
.particle {
  transition: opacity 0.1s ease-out;
}

.easter-egg-container {
  background: radial-gradient(circle at center, rgba(217, 51, 63, 0.1) 0%, transparent 70%);
  animation: pulse-bg 0.5s ease-out;
}

@keyframes pulse-bg {
  0% { background: radial-gradient(circle at center, rgba(217, 51, 63, 0.4) 0%, transparent 30%); }
  100% { background: radial-gradient(circle at center, rgba(217, 51, 63, 0.1) 0%, transparent 70%); }
}

.danmaku-bullet {
  animation: danmaku-fly 2s ease-out forwards;
}

@keyframes danmaku-fly {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  20% {
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(720deg) translateY(-100vh);
    opacity: 0;
  }
}

.easter-egg-text {
  animation: text-burst 0.5s ease-out, text-float 2s ease-in-out 0.5s;
}

@keyframes text-burst {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes text-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
