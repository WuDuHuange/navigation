import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export const useArticlesStore = defineStore('articles', () => {
  const articles = ref([])
  const loading = ref(false)
  const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const API_URL = import.meta.env.VITE_API_URL || ''

  const fetchArticles = async (page = 1) => {
    loading.value = true
    try {
      const res = await fetch(`${API_URL}/api/v1/articles?page=${page}`)
      const data = await res.json()
      if (data.success) {
        articles.value = data.data
        pagination.value = data.pagination
      }
    } catch (err) {
      console.error('获取文章失败:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchArticle = async (slug) => {
    const res = await fetch(`${API_URL}/api/v1/articles/${slug}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.data
  }

  const createArticle = async (articleData) => {
    const auth = useAuthStore()
    const res = await fetch(`${API_URL}/api/v1/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...auth.getAuthHeaders()
      },
      body: JSON.stringify(articleData)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }

  const updateArticle = async (id, articleData) => {
    const auth = useAuthStore()
    const res = await fetch(`${API_URL}/api/v1/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...auth.getAuthHeaders()
      },
      body: JSON.stringify(articleData)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }

  const deleteArticle = async (id) => {
    const auth = useAuthStore()
    const res = await fetch(`${API_URL}/api/v1/articles/${id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await fetchArticles(pagination.value.page)
    return data
  }

  return {
    articles,
    loading,
    pagination,
    fetchArticles,
    fetchArticle,
    createArticle,
    updateArticle,
    deleteArticle
  }
})
