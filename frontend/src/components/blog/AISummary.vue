<template>
  <div v-if="summary" class="bg-gradient-to-r from-primary-500/10 to-primary-600/5 border border-primary-500/20 rounded-xl p-6 mb-8">
    <div class="flex items-start gap-3">
      <div class="text-2xl">🤖</div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-primary-400 mb-2 flex items-center gap-2">
          AI 智能总结
          <span class="text-xs text-dark-500 font-normal">由 Gemini 生成</span>
        </h3>
        <p class="text-dark-300 leading-relaxed">{{ summary }}</p>
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
