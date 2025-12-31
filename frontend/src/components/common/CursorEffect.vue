<template>
  <!-- 鼠标跟随光标 - 内核点 -->
  <div
    ref="cursorDot"
    class="cursor-dot fixed pointer-events-none z-[9999]"
    :style="dotStyle"
  ></div>
  <!-- 鼠标跟随光标 - 外环 -->
  <div
    ref="cursorRing"
    class="cursor-ring fixed pointer-events-none z-[9998]"
    :style="ringStyle"
  ></div>
  <!-- 光标拖尾粒子 -->
  <div ref="trailContainer" class="fixed inset-0 pointer-events-none z-[9996] overflow-hidden"></div>
  <!-- 点击波纹容器 -->
  <div ref="rippleContainer" class="fixed inset-0 pointer-events-none z-[9997] overflow-hidden"></div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()

const cursorDot = ref(null)
const cursorRing = ref(null)
const rippleContainer = ref(null)
const trailContainer = ref(null)

const mouse = reactive({ x: 0, y: 0 })
const ringPos = reactive({ x: 0, y: 0 })
const isClicking = ref(false)
const isHovering = ref(false)
const velocity = reactive({ x: 0, y: 0 })
let lastMouse = { x: 0, y: 0 }

// 主题感知的颜色配置
const colors = computed(() => {
  if (themeStore.theme === 'dark') {
    return {
      primary: '#f97316',
      secondary: '#fb923c',
      glow: 'rgba(249, 115, 22, 0.6)',
      ring: 'rgba(249, 115, 22,',
      ripple: 'rgba(249, 115, 22,',
      trail: ['#f97316', '#fb923c', '#fdba74']
    }
  } else {
    // 日间模式使用更柔和的棕橙色
    return {
      primary: '#a16207',
      secondary: '#b45309',
      glow: 'rgba(161, 98, 7, 0.4)',
      ring: 'rgba(161, 98, 7,',
      ripple: 'rgba(180, 83, 9,',
      trail: ['#a16207', '#b45309', '#d97706']
    }
  }
})

// 点击缩放
const dotStyle = ref({})
const ringStyle = ref({})

let animationId = null
let trailTimeout = null

const updateCursor = () => {
  // 计算速度（用于动态效果）
  velocity.x = mouse.x - lastMouse.x
  velocity.y = mouse.y - lastMouse.y
  lastMouse.x = mouse.x
  lastMouse.y = mouse.y

  // 环形光标平滑跟随，悬浮时更快
  const followSpeed = isHovering.value ? 0.25 : 0.12
  ringPos.x += (mouse.x - ringPos.x) * followSpeed
  ringPos.y += (mouse.y - ringPos.y) * followSpeed

  // 动态尺寸
  const dotSize = isClicking.value ? 5 : (isHovering.value ? 10 : 8)
  const ringSize = isHovering.value ? 55 : (isClicking.value ? 25 : 40)
  const ringOpacity = isHovering.value ? 0.9 : 0.6
  const ringWidth = isHovering.value ? 3 : 2

  // 根据速度添加拉伸效果
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
  const stretch = Math.min(speed * 0.05, 0.3)
  const angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)

  dotStyle.value = {
    width: `${dotSize}px`,
    height: `${dotSize}px`,
    left: `${mouse.x}px`,
    top: `${mouse.y}px`,
    transform: `translate(-50%, -50%) scale(${1 + stretch}, ${1 - stretch * 0.5}) rotate(${angle}deg)`,
    backgroundColor: colors.value.primary,
    borderRadius: '50%',
    boxShadow: `0 0 ${isHovering.value ? 20 : 12}px ${colors.value.glow}`,
    transition: 'width 0.15s ease, height 0.15s ease, box-shadow 0.2s ease'
  }

  ringStyle.value = {
    width: `${ringSize}px`,
    height: `${ringSize}px`,
    left: `${ringPos.x}px`,
    top: `${ringPos.y}px`,
    transform: 'translate(-50%, -50%)',
    border: `${ringWidth}px solid ${colors.value.ring} ${ringOpacity})`,
    borderRadius: '50%',
    boxShadow: isHovering.value ? `0 0 15px ${colors.value.glow}` : 'none',
    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.25s cubic-bezier(0.4, 0, 0.2, 1), border 0.2s ease, box-shadow 0.2s ease'
  }

  animationId = requestAnimationFrame(updateCursor)
}

const handleMouseMove = (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
  
  // 创建拖尾粒子（节流）
  if (!trailTimeout) {
    createTrailParticle(e.clientX, e.clientY)
    trailTimeout = setTimeout(() => {
      trailTimeout = null
    }, 30)
  }
}

const handleMouseDown = (e) => {
  isClicking.value = true
  createRipple(e.clientX, e.clientY)
}

const handleMouseUp = () => {
  isClicking.value = false
}

const handleMouseOver = (e) => {
  const target = e.target
  if (target.matches('a, button, [role="button"], input, textarea, select, .clickable, .card-hover')) {
    isHovering.value = true
  }
}

const handleMouseOut = (e) => {
  const target = e.target
  if (target.matches('a, button, [role="button"], input, textarea, select, .clickable, .card-hover')) {
    isHovering.value = false
  }
}

// 创建拖尾粒子
const createTrailParticle = (x, y) => {
  if (!trailContainer.value) return
  
  const particle = document.createElement('div')
  const size = Math.random() * 4 + 2
  const color = colors.value.trail[Math.floor(Math.random() * colors.value.trail.length)]
  
  particle.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${color};
    transform: translate(-50%, -50%);
    opacity: 0.6;
    animation: trail-fade 0.5s ease-out forwards;
    pointer-events: none;
  `
  
  trailContainer.value.appendChild(particle)
  
  setTimeout(() => {
    particle.remove()
  }, 500)
}

// 点击波纹效果 - 增强版
const createRipple = (x, y) => {
  if (!rippleContainer.value) return

  // 主波纹
  const ripple = document.createElement('div')
  ripple.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: radial-gradient(circle, ${colors.value.ripple} 0.5) 0%, ${colors.value.ripple} 0) 70%);
    transform: translate(-50%, -50%);
    animation: ripple-expand 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  `
  rippleContainer.value.appendChild(ripple)

  // 次级波纹（延迟）
  setTimeout(() => {
    const ripple2 = document.createElement('div')
    ripple2.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      border: 2px solid ${colors.value.ripple} 0.3);
      transform: translate(-50%, -50%);
      animation: ripple-ring 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    `
    rippleContainer.value.appendChild(ripple2)
    setTimeout(() => ripple2.remove(), 600)
  }, 50)

  setTimeout(() => {
    ripple.remove()
  }, 700)
}

onMounted(() => {
  // 仅在非触摸设备上启用
  if (window.matchMedia('(pointer: fine)').matches) {
    document.body.style.cursor = 'none'
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    animationId = requestAnimationFrame(updateCursor)

    // 添加动态样式
    const style = document.createElement('style')
    style.textContent = `
      @keyframes ripple-expand {
        0% {
          width: 0;
          height: 0;
          opacity: 1;
        }
        100% {
          width: 180px;
          height: 180px;
          opacity: 0;
        }
      }
      
      @keyframes ripple-ring {
        0% {
          width: 0;
          height: 0;
          opacity: 1;
        }
        100% {
          width: 120px;
          height: 120px;
          opacity: 0;
        }
      }
      
      @keyframes trail-fade {
        0% {
          opacity: 0.6;
          transform: translate(-50%, -50%) scale(1);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.3);
        }
      }
      
      @media (pointer: fine) {
        * {
          cursor: none !important;
        }
      }
    `
    style.id = 'cursor-effect-styles'
    document.head.appendChild(style)
  }
})

onUnmounted(() => {
  document.body.style.cursor = ''
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('mouseover', handleMouseOver)
  document.removeEventListener('mouseout', handleMouseOut)

  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  const style = document.getElementById('cursor-effect-styles')
  if (style) style.remove()
})
</script>

<style scoped>
.cursor-dot,
.cursor-ring {
  will-change: transform, width, height, box-shadow;
  backface-visibility: hidden;
}
</style>
