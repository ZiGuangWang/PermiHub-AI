import request from '@/utils/request'

// 获取系统列表
export function getSystems(params) {
  return request({
    url: '/systems',
    method: 'get',
    params,
  })
}

// 获取系统详情
export function getSystemById(id) {
  return request({
    url: `/systems/${id}`,
    method: 'get',
  })
}

// 创建系统
export function createSystem(data) {
  return request({
    url: '/systems',
    method: 'post',
    data,
  })
}

// 更新系统
export function updateSystem(id, data) {
  return request({
    url: `/systems/${id}`,
    method: 'put',
    data,
  })
}

// 删除系统
export function deleteSystem(id) {
  return request({
    url: `/systems/${id}`,
    method: 'delete',
  })
}
