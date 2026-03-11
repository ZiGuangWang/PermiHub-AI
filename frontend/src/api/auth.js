import request from '@/utils/request'

// 用户注册
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data,
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

// 获取当前用户信息
export function getMe() {
  return request({
    url: '/auth/me',
    method: 'get',
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/auth/password',
    method: 'put',
    data,
  })
}

// 登出
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post',
  })
}
