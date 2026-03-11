import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled' },
      },
      {
        path: '/system',
        name: 'System',
        component: () => import('@/views/system/index.vue'),
        meta: { title: '系统管理', icon: 'Setting' },
      },
      {
        path: '/permission',
        name: 'Permission',
        component: () => import('@/views/permission/index.vue'),
        meta: { title: '权限管理', icon: 'Lock' },
      },
      {
        path: '/role',
        name: 'Role',
        component: () => import('@/views/role/index.vue'),
        meta: { title: '角色管理', icon: 'UserFilled' },
      },
      {
        path: '/account',
        name: 'Account',
        component: () => import('@/views/account/index.vue'),
        meta: { title: '账号管理', icon: 'Users' },
      },
      {
        path: '/log',
        name: 'Log',
        component: () => import('@/views/log/index.vue'),
        meta: { title: '操作日志', icon: 'Document' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('token')

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 权限管理系统` : '权限管理系统'

  if (to.path === '/login') {
    if (token) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    if (!token) {
      next('/login')
    } else {
      // 初始化用户信息
      if (!userStore.userInfo) {
        userStore.initUserInfo()
      }
      next()
    }
  }
})

export default router
