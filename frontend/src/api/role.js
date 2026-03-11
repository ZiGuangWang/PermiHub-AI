import request from '@/utils/request'

// 获取角色列表
export function getRoles(params) {
  return request({
    url: '/roles',
    method: 'get',
    params,
  })
}

// 获取角色详情
export function getRoleById(id) {
  return request({
    url: `/roles/${id}`,
    method: 'get',
  })
}

// 创建角色
export function createRole(data) {
  return request({
    url: '/roles',
    method: 'post',
    data,
  })
}

// 更新角色
export function updateRole(id, data) {
  return request({
    url: `/roles/${id}`,
    method: 'put',
    data,
  })
}

// 分配角色权限
export function assignPermissions(id, data) {
  return request({
    url: `/roles/${id}/permissions`,
    method: 'put',
    data,
  })
}

// 删除角色
export function deleteRole(id) {
  return request({
    url: `/roles/${id}`,
    method: 'delete',
  })
}
