import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { apiRequest } from '../utils/apiClient'

export const useArticlesStore = defineStore('articles', () => {
  const articles = ref([])
  const loading = ref(false)
  const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })

  const fetchArticles = async (page = 1) => {
    loading.value = true
    try {
      const data = await apiRequest(`/api/v1/articles?page=${page}`)
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
    const data = await apiRequest(`/api/v1/articles/${slug}`)
    return data.data
  }

  const createArticle = async (articleData) => {
    const auth = useAuthStore()
    const data = await apiRequest('/api/v1/articles', {
      method: 'POST',
      headers: {
        ...auth.getAuthHeaders()
      },
      body: articleData
    })
    return data
  }

  const updateArticle = async (id, articleData) => {
    const auth = useAuthStore()
    const data = await apiRequest(`/api/v1/articles/${id}`, {
      method: 'PUT',
      headers: {
        ...auth.getAuthHeaders()
      },
      body: articleData
    })
    return data
  }

  const deleteArticle = async (id) => {
    const auth = useAuthStore()
    const data = await apiRequest(`/api/v1/articles/${id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
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
