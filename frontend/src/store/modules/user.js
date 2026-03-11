import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getMe } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  // 登录
  async function loginAction(loginForm) {
    const res = await login(loginForm)
    token.value = res.data.token
    userInfo.value = res.data.user
    
    // 存储到 localStorage
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    
    return res
  }

  // 获取用户信息
  async function getUserInfo() {
    const res = await getMe()
    userInfo.value = res.data
    return res
  }

  // 登出
  async function logoutAction() {
    try {
      await logout()
    } catch (error) {
      console.error('登出接口调用失败:', error)
    } finally {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // 初始化用户信息
  function initUserInfo() {
    const savedUser = localStorage.getItem('user')
    if (savedUser && !userInfo.value) {
      userInfo.value = JSON.parse(savedUser)
    }
  }

  return {
    token,
    userInfo,
    loginAction,
    getUserInfo,
    logoutAction,
    initUserInfo,
  }
})
