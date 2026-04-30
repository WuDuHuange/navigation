import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiRequest } from '../utils/apiClient'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || null)
  const admin = ref(JSON.parse(localStorage.getItem('admin_info') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  const login = async (username, password) => {
    const data = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { username, password }
    })

    token.value = data.data.token
    admin.value = data.data.admin
    
    localStorage.setItem('admin_token', data.data.token)
    localStorage.setItem('admin_info', JSON.stringify(data.data.admin))
    
    return data
  }

  const logout = () => {
    token.value = null
    admin.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
  }

  const getAuthHeaders = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return {
    token,
    admin,
    isLoggedIn,
    login,
    logout,
    getAuthHeaders
  }
})
