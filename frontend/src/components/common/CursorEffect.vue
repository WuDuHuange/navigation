<template>
  <!-- 鼠标跟随光标 -->
  <div
    ref="cursorDot"
    class="cursor-dot fixed pointer-events-none z-[9999] mix-blend-difference"
    :style="dotStyle"
  ></div>
  <div
    ref="cursorRing"
    class="cursor-ring fixed pointer-events-none z-[9998]"
    :style="ringStyle"
  ></div>
  
  <!-- 点击波纹容器 -->
  <div ref="rippleContainer" class="fixed inset-0 pointer-events-none z-[9997] overflow-hidden"></div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

const cursorDot = ref(null)
const cursorRing = ref(null)
const rippleContainer = ref(null)

const mouse = reactive({ x: 0, y: 0 })
const ringPos = reactive({ x: 0, y: 0 })
const isClicking = ref(false)
const isHovering = ref(false)

// 点击缩放
const dotStyle = ref({})
const ringStyle = ref({})

let animationId = null

const updateCursor = () => {
  // 环形光标平滑跟随
  ringPos.x += (mouse.x - ringPos.x) * 0.15
  ringPos.y += (mouse.y - ringPos.y) * 0.15

  const dotSize = isClicking.value ? 6 : 8
  const ringSize = isHovering.value ? 50 : (isClicking.value ? 30 : 40)
  const ringOpacity = isHovering.value ? 0.8 : 0.5

  dotStyle.value = {
    width: `${dotSize}px`,
    height: `${dotSize}px`,
    left: `${mouse.x}px`,
    top: `${mouse.y}px`,
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#f97316',
    borderRadius: '50%',
    transition: 'width 0.2s, height 0.2s'
  }

  ringStyle.value = {
    width: `${ringSize}px`,
    height: `${ringSize}px`,
    left: `${ringPos.x}px`,
    top: `${ringPos.y}px`,
    transform: 'translate(-50%, -50%)',
    border: '2px solid rgba(249, 115, 22, ' + ringOpacity + ')',
    borderRadius: '50%',
    transition: 'width 0.3s, height 0.3s, border 0.3s'
  }

  animationId = requestAnimationFrame(updateCursor)
}

const handleMouseMove = (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
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
  if (target.matches('a, button, [role="button"], input, textarea, select, .clickable')) {
    isHovering.value = true
  }
}

const handleMouseOut = (e) => {
  const target = e.target
  if (target.matches('a, button, [role="button"], input, textarea, select, .clickable')) {
    isHovering.value = false
  }
}

// 点击波纹效果
const createRipple = (x, y) => {
  if (!rippleContainer.value) return

  const ripple = document.createElement('div')
  ripple.className = 'click-ripple'
  ripple.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, rgba(249, 115, 22, 0) 70%);
    transform: translate(-50%, -50%);
    animation: ripple-expand 0.6s ease-out forwards;
  `

  rippleContainer.value.appendChild(ripple)

  // 动画结束后移除
  setTimeout(() => {
    ripple.remove()
  }, 600)
}

onMounted(() => {
  // 隐藏默认光标
  document.body.style.cursor = 'none'
  document.querySelectorAll('a, button, input, textarea, select').forEach(el => {
    el.style.cursor = 'none'
  })

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
        width: 150px;
        height: 150px;
        opacity: 0;
      }
    }
    
    * {
      cursor: none !important;
    }
  `
  style.id = 'cursor-effect-styles'
  document.head.appendChild(style)
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
  will-change: transform, width, height;
}
</style>
