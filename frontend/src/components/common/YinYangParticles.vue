<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none z-0"
    :width="canvasW"
    :height="canvasH"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

/* ====================================================
  阴阳玉 — 点阵构型（类似参考图风格）
  ==================================================== */

const canvasRef = ref(null)
const canvasW = ref(window.innerWidth)
const canvasH = ref(window.innerHeight)

// ---- 配置 ----
const DOT_STEP = 8                 // 点阵网格间距
const DOT_BASE_SIZE = 1.6          // 基础点大小
const ORBITER_COUNT = 42           // 外围少量漂浮点
const ROTATE_SPEED = 0.0014
const BREATHE_SPEED = 0.0011
const BREATHE_AMP_RATIO = 0.02
const SCATTER_RADIUS = 140
const SCATTER_FORCE = 2.8
const RETURN_FACTOR = 0.06
const FRICTION = 0.9

// ---- 颜色 ----
const COLOR_YIN = '#D9333F'
const COLOR_YANG = '#BFAE9F'

// ---- 状态 ----
let ctx = null
let animId = null
let mouseX = -9999
let mouseY = -9999
let globalAngle = 0
let time = 0
let scrollSpeed = 0
let lastScrollY = 0
let dots = []
let orbiters = []

function getLayout() {
  const w = window.innerWidth
  const h = window.innerHeight
  const rRatio = w < 900 ? 0.2 : 0.24
  const R = Math.max(120, Math.min(w, h) * rRatio)
  const cx = Math.min(w * 0.82, w - R - 20)
  const cy = w < 900 ? h * 0.62 : h * 0.5
  return { w, h, R, cx, cy }
}

// 判断局部点在阴面还是阳面
function isYinSide(lx, ly, R) {
  const r = R / 2
  const distTop = Math.hypot(lx, ly + r)
  const distBottom = Math.hypot(lx, ly - r)
  if (distTop <= r) return true
  if (distBottom <= r) return false
  return lx < 0
}

function classifyDot(lx, ly, R) {
  const r = R / 2
  const eyeR = R * 0.11
  const distTopEye = Math.hypot(lx, ly + r)
  const distBottomEye = Math.hypot(lx, ly - r)

  if (distTopEye <= eyeR) return { color: COLOR_YANG, alpha: 0.78 }
  if (distBottomEye <= eyeR) return { color: COLOR_YIN, alpha: 0.86 }
  if (isYinSide(lx, ly, R)) return { color: COLOR_YIN, alpha: 0.72 }
  return { color: COLOR_YANG, alpha: 0.62 }
}

function generateDots() {
  const { R, cx, cy } = getLayout()
  const result = []

  for (let y = -R; y <= R; y += DOT_STEP) {
    for (let x = -R; x <= R; x += DOT_STEP) {
      if (x * x + y * y > R * R) continue

      const jitterX = (Math.random() - 0.5) * 0.7
      const jitterY = (Math.random() - 0.5) * 0.7
      const lx = x + jitterX
      const ly = y + jitterY
      const styled = classifyDot(lx, ly, R)

      result.push({
        lx,
        ly,
        x: cx + lx,
        y: cy + ly,
        vx: 0,
        vy: 0,
        color: styled.color,
        alpha: styled.alpha,
        size: DOT_BASE_SIZE + (Math.random() - 0.5) * 0.25,
        phase: Math.random() * Math.PI * 2
      })
    }
  }

  return result
}

function generateOrbiters() {
  const { R, cx, cy } = getLayout()
  const result = []

  for (let i = 0; i < ORBITER_COUNT; i++) {
    const angle = (i / ORBITER_COUNT) * Math.PI * 2 + Math.random() * 0.6
    const dist = R * (1.05 + Math.random() * 0.25)
    result.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      color: Math.random() > 0.45 ? COLOR_YIN : COLOR_YANG,
      size: 1.2 + Math.random() * 1.1,
      alpha: 0.35 + Math.random() * 0.25
    })
  }

  return result
}

// ======== 主循环 ========
function animate() {
  if (!ctx) return
  const { w, h, R, cx, cy } = getLayout()
  ctx.clearRect(0, 0, w, h)

  time++
  globalAngle += ROTATE_SPEED + scrollSpeed * 0.0001
  scrollSpeed *= 0.95

  const breatheScale = 1 + Math.sin(time * BREATHE_SPEED) * BREATHE_AMP_RATIO
  const cosA = Math.cos(globalAngle)
  const sinA = Math.sin(globalAngle)

  // 点阵阴阳主体
  for (let i = 0; i < dots.length; i++) {
    const p = dots[i]
    const rlx = p.lx * breatheScale
    const rly = p.ly * breatheScale
    const tx = cx + rlx * cosA - rly * sinA
    const ty = cy + rlx * sinA + rly * cosA

    p.vx += (tx - p.x) * RETURN_FACTOR
    p.vy += (ty - p.y) * RETURN_FACTOR

    const dx = p.x - mouseX
    const dy = p.y - mouseY
    const dist = Math.hypot(dx, dy)
    if (dist < SCATTER_RADIUS && dist > 0) {
      const force = (1 - dist / SCATTER_RADIUS) * SCATTER_FORCE
      p.vx += (dx / dist) * force
      p.vy += (dy / dist) * force
    }

    p.vx *= FRICTION
    p.vy *= FRICTION
    p.x += p.vx
    p.y += p.vy

    const pulse = 0.92 + Math.sin(time * 0.018 + p.phase) * 0.08
    const alpha = p.alpha * pulse

    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  // 外围稀疏漂浮点，营造类似参考图的环境颗粒
  for (let i = 0; i < orbiters.length; i++) {
    const p = orbiters[i]

    p.x += p.vx + Math.sin(time * 0.01 + i) * 0.02
    p.y += p.vy + Math.cos(time * 0.01 + i) * 0.02

    const dx = p.x - cx
    const dy = p.y - cy
    const dist = Math.hypot(dx, dy)
    if (dist > R * 1.35) {
      p.vx += (-dx / dist) * 0.04
      p.vy += (-dy / dist) * 0.04
    }

    p.vx *= 0.98
    p.vy *= 0.98

    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  animId = requestAnimationFrame(animate)
}

// ---- 事件 ----
function onMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}
function onMouseLeave() {
  mouseX = -9999
  mouseY = -9999
}
function onScroll() {
  const delta = Math.abs(window.scrollY - lastScrollY)
  scrollSpeed += delta * 0.5
  lastScrollY = window.scrollY
}
function onResize() {
  canvasW.value = window.innerWidth
  canvasH.value = window.innerHeight
  dots = generateDots()
  orbiters = generateOrbiters()
}

// ---- 生命周期 ----
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')

  dots = generateDots()
  orbiters = generateOrbiters()

  // 入场：点从轻微散开状态聚合到点阵图
  const { cx, cy, R } = getLayout()
  for (const p of dots) {
    p.x = cx + (Math.random() - 0.5) * R * 1.6
    p.y = cy + (Math.random() - 0.5) * R * 1.6
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseleave', onMouseLeave)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseleave', onMouseLeave)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (animId) cancelAnimationFrame(animId)
  ctx = null
})
</script>
