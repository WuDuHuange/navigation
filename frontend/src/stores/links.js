import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export const useLinksStore = defineStore('links', () => {
  const links = ref([])
  const loading = ref(false)
  const API_URL = import.meta.env.VITE_API_URL || ''

  const fetchLinks = async () => {
    loading.value = true
    try {
      const res = await fetch(`${API_URL}/api/v1/links`)
      const data = await res.json()
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
    const res = await fetch(`${API_URL}/api/v1/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...auth.getAuthHeaders()
      },
      body: JSON.stringify(linkData)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await fetchLinks()
    return data
  }

  const updateLink = async (id, linkData) => {
    const auth = useAuthStore()
    const res = await fetch(`${API_URL}/api/v1/links/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...auth.getAuthHeaders()
      },
      body: JSON.stringify(linkData)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await fetchLinks()
    return data
  }

  const deleteLink = async (id) => {
    const auth = useAuthStore()
    const res = await fetch(`${API_URL}/api/v1/links/${id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
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
