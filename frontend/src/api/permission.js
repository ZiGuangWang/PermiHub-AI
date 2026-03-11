import request from '@/utils/request'

// 获取权限列表
export function getPermissions(params) {
  return request({
    url: '/permissions',
    method: 'get',
    params,
  })
}

// 获取权限树
export function getPermissionTree(params) {
  return request({
    url: '/permissions/tree',
    method: 'get',
    params,
  })
}

// 获取权限详情
export function getPermissionById(id) {
  return request({
    url: `/permissions/${id}`,
    method: 'get',
  })
}

// 创建权限
export function createPermission(data) {
  return request({
    url: '/permissions',
    method: 'post',
    data,
  })
}

// 更新权限
export function updatePermission(id, data) {
  return request({
    url: `/permissions/${id}`,
    method: 'put',
    data,
  })
}

// 删除权限
export function deletePermission(id) {
  return request({
    url: `/permissions/${id}`,
    method: 'delete',
  })
}
