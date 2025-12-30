import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 根据时间自动判断初始主题（6:00-18:00 为日间）
  const getAutoTheme = () => {
    const hour = new Date().getHours()
    return hour >= 6 && hour < 18 ? 'light' : 'dark'
  }

  // 从 localStorage 读取或自动判断
  const savedTheme = localStorage.getItem('theme')
  const theme = ref(savedTheme || getAutoTheme())

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  // 设置特定主题
  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  // 监听变化并保存到 localStorage + 更新 document class
  watch(theme, (val) => {
    localStorage.setItem('theme', val)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(val)
  }, { immediate: true })

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light'
  }
})
