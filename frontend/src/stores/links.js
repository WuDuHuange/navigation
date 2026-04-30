import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { apiRequest } from '../utils/apiClient'

export const useLinksStore = defineStore('links', () => {
  const links = ref([])
  const loading = ref(false)

  const fetchLinks = async () => {
    loading.value = true
    try {
      const data = await apiRequest('/api/v1/links')
      if (data.success) {
        links.value = data.data
      }
    } catch (err) {
      console.error('获取链接失败:', err)
    } finally {
      loading.value = false
    }
  }

  const createLink = async (linkData) => {
    const auth = useAuthStore()
    const data = await apiRequest('/api/v1/links', {
      method: 'POST',
      headers: {
        ...auth.getAuthHeaders()
      },
      body: linkData
    })
    await fetchLinks()
    return data
  }

  const updateLink = async (id, linkData) => {
    const auth = useAuthStore()
    const data = await apiRequest(`/api/v1/links/${id}`, {
      method: 'PUT',
      headers: {
        ...auth.getAuthHeaders()
      },
      body: linkData
    })
    await fetchLinks()
    return data
  }

  const deleteLink = async (id) => {
    const auth = useAuthStore()
    const data = await apiRequest(`/api/v1/links/${id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    await fetchLinks()
    return data
  }

  return {
    links,
    loading,
    fetchLinks,
    createLink,
    updateLink,
    deleteLink
  }
})
