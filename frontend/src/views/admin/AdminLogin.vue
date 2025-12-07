<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-4">🔐</div>
        <h1 class="text-2xl font-bold text-white">管理员登录</h1>
        <p class="text-dark-400 mt-2">请输入管理员凭据以继续</p>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="bg-dark-800/50 border border-dark-700 rounded-xl p-8">
        <div class="space-y-6">
          <!-- 用户名 -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">用户名</label>
            <input
              v-model="form.username"
              type="text"
              required
              autocomplete="username"
              class="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
              placeholder="请输入用户名"
            />
          </div>

          <!-- 密码 -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">密码</label>
            <input
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
              placeholder="请输入密码"
            />
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {{ error }}
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? '登录中...' : '登 录' }}
          </button>
        </div>
      </form>

      <!-- 返回链接 -->
      <div class="text-center mt-6">
        <router-link to="/" class="text-dark-400 hover:text-primary-400 text-sm transition-colors">
          ← 返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(form.value.username, form.value.password)
    router.push('/admin/dashboard')
  } catch (err) {
    error.value = err.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>
