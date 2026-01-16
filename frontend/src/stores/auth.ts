// frontend/src/stores/auth.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const router = useRouter()
  
  // Computed property to check if user is logged in
  const isLoggedIn = computed(() => user.value !== null)

  const setUser = (userData: any) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
  }

  // Initialize user from localStorage if exists
  const initUser = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      user.value = JSON.parse(userData)
    }
  }

  // Logout method
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      clearUser()
      router.push('/login')
    }
  }

  return {
    user,
    isLoggedIn,
    setUser,
    clearUser,
    initUser,
    logout
  }
})