<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-sm shadow-lg border max-w-sm animate-slideInRight"
        :class="toastClass(toast.type)"
      >
        <span class="text-lg flex-shrink-0 mt-0.5">{{ iconFor(toast.type) }}</span>
        <div class="flex-1 min-w-0">
          <p v-if="toast.title" class="font-medium text-sm mb-0.5">{{ toast.title }}</p>
          <p class="text-sm opacity-90">{{ toast.message }}</p>
        </div>
        <button
          @click="remove(toast.id)"
          class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
        >×</button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

const toastClass = (type) => {
  const map = {
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800'
  }
  return map[type] || map.info
}

const iconFor = (type) => {
  const map = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  }
  return map[type] || map.info
}

const add = (message, type = 'info', title = '', duration = 4000) => {
  const id = ++nextId
  toasts.value.push({ id, message, type, title })
  if (duration > 0) {
    setTimeout(() => remove(id), duration)
  }
  return id
}

const remove = (id) => {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx >= 0) toasts.value.splice(idx, 1)
}

const success = (message, title = '成功') => add(message, 'success', title)
const error = (message, title = '错误') => add(message, 'error', title, 6000)
const warning = (message, title = '注意') => add(message, 'warning', title)
const info = (message, title = '提示') => add(message, 'info', title)

defineExpose({ add, remove, success, error, warning, info })
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(60px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}
</style>
