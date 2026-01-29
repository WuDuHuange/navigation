<template>
  <div class="relative">
    <!-- 上传按钮 -->
    <label
      class="flex items-center gap-2 px-4 py-2 bg-paper-200 hover:bg-paper-300 text-ink-600 rounded-sm cursor-pointer transition-colors border border-ink-200"
      :class="{ 'opacity-50 cursor-not-allowed': uploading }"
    >
      <span class="seal-icon text-xs">图</span>
      <span>{{ uploading ? '上传中...' : '插入图片' }}</span>
      <input
        type="file"
        accept="image/*"
        class="hidden"
        :disabled="uploading"
        @change="handleFileSelect"
      />
    </label>

    <!-- 上传进度 -->
    <div v-if="uploading" class="absolute top-full left-0 right-0 mt-2">
      <div class="h-1 bg-ink-200 rounded-full overflow-hidden">
        <div class="h-full bg-primary-500 transition-all duration-300" :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="absolute top-full left-0 mt-2 text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

const emit = defineEmits(['uploaded'])

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || ''

const uploading = ref(false)
const progress = ref(0)
const error = ref('')

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error.value = '只支持 JPEG、PNG、GIF、WebP 格式'
    return
  }

  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    error.value = '图片大小不能超过 5MB'
    return
  }

  error.value = ''
  uploading.value = true
  progress.value = 0

  const formData = new FormData()
  formData.append('image', file)

  try {
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        progress.value = Math.round((e.loaded / e.total) * 100)
      }
    }

    // 使用 Promise 包装 XHR
    const response = await new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(JSON.parse(xhr.responseText).error || '上传失败'))
        }
      }
      xhr.onerror = () => reject(new Error('网络错误'))
      
      xhr.open('POST', `${API_URL}/api/v1/upload`)
      
      const token = authStore.token
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      
      xhr.send(formData)
    })

    // 成功，触发事件
    emit('uploaded', response.data)
  } catch (err) {
    error.value = err.message
  } finally {
    uploading.value = false
    progress.value = 0
    // 重置 input
    event.target.value = ''
  }
}
</script>
