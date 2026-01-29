<template>
  <div v-if="summary" class="card p-6 mb-8 border-l-4 border-l-primary-500">
    <div class="flex items-start gap-3">
      <div class="seal-icon text-sm">智</div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-primary-500 mb-2 flex items-center gap-2">
          AI 智能总结
          <span class="text-xs text-ink-400 font-normal">由 Gemini 生成</span>
        </h3>
        <p class="text-ink-600 leading-relaxed">{{ summary }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  summary: {
    type: String,
    default: ''
  }
})
</script>
