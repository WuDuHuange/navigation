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

/* ============================
   粒子阴阳玉 — 动态背景
   ============================= */

const canvasRef = ref(null)
const canvasW = ref(window.innerWidth)
const canvasH = ref(window.innerHeight)

// ---- 配置 ----
const PARTICLE_COUNT = 1200      // 粒子总数（密集以勾勒形状）
const getRadius = () => Math.min(window.innerWidth, window.innerHeight) * 0.38  // 自适应大半径
const BREATHE_AMP = 8            // 呼吸起伏幅度
const BREATHE_SPEED = 0.0012     // 呼吸频率
const ROTATE_SPEED = 0.002       // 自转速度 (弧度/帧)
const SCATTER_RADIUS = 320       // 鼠标排斥半径
const SCATTER_FORCE = 6          // 排斥力度
const RETURN_FACTOR = 0.045      // 回归吸引力
const FRICTION = 0.90            // 速度衰减

// ---- 颜色 ----
const COLOR_RED = '#D9333F'
const COLOR_WHITE = '#FFFFFF'
const COLOR_RED_GLOW = 'rgba(217,51,63,0.6)'
const COLOR_WHITE_GLOW = 'rgba(255,255,255,0.5)'

// ---- 状态 ----
let ctx = null
let animId = null
let mouseX = -9999
let mouseY = -9999
let globalAngle = 0              // 全局旋转角
let time = 0
let scrollSpeed = 0
let lastScrollY = 0
let particles = []

// 阴阳玉中心 — 屏幕右侧偏中
const getCenterX = () => window.innerWidth * 0.72
const getCenterY = () => window.innerHeight * 0.50

// ---- 阴阳玉坐标生成 ----
// 判断点 (x,y)（相对中心，未旋转）属于黑半还是白半
function isYinSide(lx, ly, R) {
  const r = R / 2
  // 上半圆小圆中心
  const distTop = Math.sqrt(lx * lx + (ly + r) * (ly + r))
  // 下半圆小圆中心
  const distBot = Math.sqrt(lx * lx + (ly - r) * (ly - r))
  // 标准阴阳鱼判断
  if (distTop <= r) return true    // 在上半小圆内 → 阴
  if (distBot <= r) return false   // 在下半小圆内 → 阳
  return lx < 0                    // 左半 → 阴
}

function generateTargets() {
  const R = getRadius()
  const cx = getCenterX()
  const cy = getCenterY()
  const targets = []

  // 均匀撒点 — 使用 Poisson-like 抖动避免规则环状纹路
  let attempts = 0
  while (targets.length < PARTICLE_COUNT && attempts < PARTICLE_COUNT * 30) {
    attempts++
    // 使用 r² 均匀分布而非 sqrt(rand)，额外加抖动
    const angle = Math.random() * Math.PI * 2
    const u = Math.random()
    const dist = Math.sqrt(u) * R
    // 加入微小随机偏移打破同心环
    const jitter = (Math.random() - 0.5) * 3
    const lx = Math.cos(angle) * dist + jitter
    const ly = Math.sin(angle) * dist + jitter

    // 确保还在大圆内
    if (lx * lx + ly * ly > R * R) continue

    const yin = isYinSide(lx, ly, R)

    // 阴阳鱼眼
    const r = R / 2
    const eyeR = R * 0.13
    const distTopEye = Math.sqrt(lx * lx + (ly + r) * (ly + r))
    const distBotEye = Math.sqrt(lx * lx + (ly - r) * (ly - r))
    let color, glow
    if (distTopEye < eyeR) {
      color = COLOR_WHITE
      glow = COLOR_WHITE_GLOW
    } else if (distBotEye < eyeR) {
      color = COLOR_RED
      glow = COLOR_RED_GLOW
    } else if (yin) {
      color = COLOR_RED
      glow = COLOR_RED_GLOW
    } else {
      color = COLOR_WHITE
      glow = COLOR_WHITE_GLOW
    }

    // 统一粒子大小：2.5 ± 0.3，保持均匀密实
    const sz = 2.5 + (Math.random() - 0.5) * 0.6

    targets.push({
      lx, ly,
      x: cx + lx,
      y: cy + ly,
      vx: 0,
      vy: 0,
      color,
      glow,
      size: sz,
      baseSize: sz,
      phase: Math.random() * Math.PI * 2
    })
  }
  return targets
}

// ---- 主循环 ----
function animate() {
  if (!ctx) return
  const W = canvasW.value
  const H = canvasH.value

  // 每帧完全清除（消除旋转残影环纹）
  ctx.clearRect(0, 0, W, H)

  time++
  globalAngle += ROTATE_SPEED + scrollSpeed * 0.0001
  scrollSpeed *= 0.95 // 衰减

  const cx = getCenterX()
  const cy = getCenterY()
  const breathe = Math.sin(time * BREATHE_SPEED) * BREATHE_AMP
  const cosA = Math.cos(globalAngle)
  const sinA = Math.sin(globalAngle)

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]

    // 目标位置 = 旋转后的局部坐标 + 中心 + 呼吸
    const scale = 1 + breathe / getRadius()
    const rlx = p.lx * scale
    const rly = p.ly * scale
    const tx = cx + rlx * cosA - rly * sinA
    const ty = cy + rlx * sinA + rly * cosA

    // 吸引力 → 回到目标
    p.vx += (tx - p.x) * RETURN_FACTOR
    p.vy += (ty - p.y) * RETURN_FACTOR

    // 鼠标排斥力
    const dx = p.x - mouseX
    const dy = p.y - mouseY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < SCATTER_RADIUS && dist > 0) {
      const force = (1 - dist / SCATTER_RADIUS) * SCATTER_FORCE
      p.vx += (dx / dist) * force
      p.vy += (dy / dist) * force
    }

    // 摩擦
    p.vx *= FRICTION
    p.vy *= FRICTION

    // 更新位置
    p.x += p.vx
    p.y += p.vy

    // 微弱呼吸尺寸变化
    const sizeBreath = 1 + Math.sin(time * 0.003 + p.phase) * 0.08
    p.size = p.baseSize * sizeBreath

    // 根据速度微调透明度（静止时更实，散开时稍亮）
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    const alpha = Math.min(1, 0.75 + speed * 0.05)

    // 绘制 — 不用 shadowBlur（性能好，避免模糊）
    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  // 中心微弱辉光
  const R = getRadius()
  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.15)
  glowGrad.addColorStop(0, 'rgba(217,51,63,0.035)')
  glowGrad.addColorStop(0.5, 'rgba(217,51,63,0.012)')
  glowGrad.addColorStop(1, 'rgba(217,51,63,0)')
  ctx.globalAlpha = 1
  ctx.fillStyle = glowGrad
  ctx.beginPath()
  ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2)
  ctx.fill()

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
  // 重新生成目标（半径随窗口变化）
  const newTargets = generateTargets()
  // 用新目标替换；多退少补
  for (let i = 0; i < Math.min(particles.length, newTargets.length); i++) {
    particles[i].lx = newTargets[i].lx
    particles[i].ly = newTargets[i].ly
    particles[i].color = newTargets[i].color
    particles[i].glow = newTargets[i].glow
    particles[i].baseSize = newTargets[i].baseSize
  }
  if (newTargets.length > particles.length) {
    particles.push(...newTargets.slice(particles.length))
  } else if (newTargets.length < particles.length) {
    particles.length = newTargets.length
  }
}

// ---- 生命周期 ----
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')

  particles = generateTargets()
  // 初始散布 → 让粒子从散开状态聚合（入场动画）
  for (const p of particles) {
    p.x = getCenterX() + (Math.random() - 0.5) * window.innerWidth * 0.6
    p.y = getCenterY() + (Math.random() - 0.5) * window.innerHeight * 0.6
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
