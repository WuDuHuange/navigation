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
   阴阳玉 — 实心图形 + 边缘浮游粒子（混合方案）
   ==================================================== */

const canvasRef = ref(null)
const canvasW = ref(window.innerWidth)
const canvasH = ref(window.innerHeight)

// ---- 配置 ----
const EDGE_PARTICLES = 160        // 边缘浮游粒子数
const getRadius = () => Math.min(window.innerWidth, window.innerHeight) * 0.32
const SHAPE_ALPHA = 0.10          // 实心图形透明度（水印感）
const ROTATE_SPEED = 0.002        // 自转速度
const BREATHE_AMP = 6
const BREATHE_SPEED = 0.0012
const SCATTER_RADIUS = 200        // 鼠标排斥半径
const SCATTER_FORCE = 5
const RETURN_FACTOR = 0.03
const FRICTION = 0.91

// ---- 颜色 ----
const COLOR_YIN = '#D9333F'
const COLOR_YANG = '#B8A99A'

// ---- 状态 ----
let ctx = null
let animId = null
let mouseX = -9999
let mouseY = -9999
let globalAngle = 0
let time = 0
let scrollSpeed = 0
let lastScrollY = 0
let edgeParticles = []

// 中心定在屏幕右侧 ~75%，稍偏上
const getCenterX = () => window.innerWidth * 0.76
const getCenterY = () => window.innerHeight * 0.46

// ======== 绘制实心阴阳图形 ========
function drawYinYang(cx, cy, R, angle) {
  const r = R / 2         // 半径的一半（S 曲线用）
  const eyeR = R * 0.10   // 鱼眼半径

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.globalAlpha = SHAPE_ALPHA

  // --- 整个圆：先画阳面（暖灰色）底 ---
  ctx.beginPath()
  ctx.arc(0, 0, R, 0, Math.PI * 2)
  ctx.fillStyle = COLOR_YANG
  ctx.fill()

  // --- 阴面（红色）：左半圆 + S 曲线（两个半圆弧）---
  ctx.beginPath()
  // 左半大圆弧（从下到上，逆时针 = 左半边）
  ctx.arc(0, 0, R, Math.PI / 2, -Math.PI / 2, false)
  // 上半小圆弧（中心在 (0,-r)），向左凸出
  ctx.arc(0, -r, r, -Math.PI / 2, Math.PI / 2, false)
  // 下半小圆弧（中心在 (0,+r)），向右凸出
  ctx.arc(0, r, r, -Math.PI / 2, Math.PI / 2, true)
  ctx.closePath()
  ctx.fillStyle = COLOR_YIN
  ctx.fill()

  // --- 鱼眼 ---
  // 上鱼眼（阴区内，画阳色圆）
  ctx.beginPath()
  ctx.arc(0, -r, eyeR, 0, Math.PI * 2)
  ctx.fillStyle = COLOR_YANG
  ctx.fill()

  // 下鱼眼（阳区内，画阴色圆）
  ctx.beginPath()
  ctx.arc(0, r, eyeR, 0, Math.PI * 2)
  ctx.fillStyle = COLOR_YIN
  ctx.fill()

  // --- 描一个极淡的外圈轮廓让边界更清晰 ---
  ctx.globalAlpha = SHAPE_ALPHA * 0.6
  ctx.beginPath()
  ctx.arc(0, 0, R, 0, Math.PI * 2)
  ctx.strokeStyle = COLOR_YIN
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.restore()
}

// ======== 边缘浮游粒子 ========
function generateEdgeParticles() {
  const R = getRadius()
  const cx = getCenterX()
  const cy = getCenterY()
  const pts = []

  for (let i = 0; i < EDGE_PARTICLES; i++) {
    // 沿大圆边缘 + 少量向外偏移
    const theta = (i / EDGE_PARTICLES) * Math.PI * 2 + Math.random() * 0.3
    const rDist = R + (Math.random() - 0.3) * R * 0.35 // 大部分在外圈附近
    const lx = Math.cos(theta) * rDist
    const ly = Math.sin(theta) * rDist
    const isRed = Math.random() < 0.6

    pts.push({
      lx, ly,
      x: cx + lx,
      y: cy + ly,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: isRed ? COLOR_YIN : COLOR_YANG,
      size: Math.random() * 2 + 1.5,
      baseSize: 0,
      phase: Math.random() * Math.PI * 2,
      // 轨道漂移速度
      drift: (Math.random() - 0.5) * 0.003
    })
  }
  pts.forEach(p => { p.baseSize = p.size })
  return pts
}

// ======== 主循环 ========
function animate() {
  if (!ctx) return
  const W = canvasW.value
  const H = canvasH.value
  ctx.clearRect(0, 0, W, H)

  time++
  globalAngle += ROTATE_SPEED + scrollSpeed * 0.0001
  scrollSpeed *= 0.95

  const cx = getCenterX()
  const cy = getCenterY()
  const R = getRadius()
  const breathe = Math.sin(time * BREATHE_SPEED) * BREATHE_AMP
  const currentR = R + breathe
  const cosA = Math.cos(globalAngle)
  const sinA = Math.sin(globalAngle)

  // 1) 绘制实心阴阳图形
  drawYinYang(cx, cy, currentR, globalAngle)

  // 2) 绘制边缘浮游粒子
  for (let i = 0; i < edgeParticles.length; i++) {
    const p = edgeParticles[i]

    // 目标 = 旋转后的局部坐标 + 呼吸缩放
    const scale = currentR / getRadius()
    const rlx = p.lx * scale
    const rly = p.ly * scale
    // 加轨道漂移让粒子缓缓绕转
    p.lx = p.lx * Math.cos(p.drift) - p.ly * Math.sin(p.drift)
    p.ly = p.lx * Math.sin(p.drift) + p.ly * Math.cos(p.drift)

    const tx = cx + rlx * cosA - rly * sinA
    const ty = cy + rlx * sinA + rly * cosA

    p.vx += (tx - p.x) * RETURN_FACTOR
    p.vy += (ty - p.y) * RETURN_FACTOR

    // 鼠标排斥
    const dx = p.x - mouseX
    const dy = p.y - mouseY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < SCATTER_RADIUS && dist > 0) {
      const force = (1 - dist / SCATTER_RADIUS) * SCATTER_FORCE
      p.vx += (dx / dist) * force
      p.vy += (dy / dist) * force
    }

    p.vx *= FRICTION
    p.vy *= FRICTION
    p.x += p.vx
    p.y += p.vy

    const sizeB = 1 + Math.sin(time * 0.003 + p.phase) * 0.15
    p.size = p.baseSize * sizeB

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    const alpha = Math.min(0.7, 0.3 + speed * 0.08)

    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur = 4
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.shadowBlur = 0

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
  edgeParticles = generateEdgeParticles()
}

// ---- 生命周期 ----
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')

  edgeParticles = generateEdgeParticles()
  // 入场：粒子从散开位置聚合
  for (const p of edgeParticles) {
    p.x = getCenterX() + (Math.random() - 0.5) * window.innerWidth * 0.5
    p.y = getCenterY() + (Math.random() - 0.5) * window.innerHeight * 0.5
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
