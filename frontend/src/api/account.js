import request from '@/utils/request'

// 获取账号列表
export function getAccounts(params) {
  return request({
    url: '/accounts',
    method: 'get',
    params,
  })
}

// 获取账号详情
export function getAccountById(id) {
  return request({
    url: `/accounts/${id}`,
    method: 'get',
  })
}

// 创建账号
export function createAccount(data) {
  return request({
    url: '/accounts',
    method: 'post',
    data,
  })
}

// 更新账号
export function updateAccount(id, data) {
  return request({
    url: `/accounts/${id}`,
    method: 'put',
    data,
  })
}

// 重置密码
export function resetPassword(id, data) {
  return request({
    url: `/accounts/${id}/password`,
    method: 'put',
    data,
  })
}

// 删除账号
export function deleteAccount(id) {
  return request({
    url: `/accounts/${id}`,
    method: 'delete',
  })
}

// 分配账号角色
export function assignRole(id, data) {
  return request({
    url: `/accounts/${id}/role`,
    method: 'put',
    data,
  })
}

// 调整账号权限
export function adjustPermissions(id, data) {
  return request({
    url: `/accounts/${id}/permissions`,
    method: 'put',
    data,
  })
}

// 获取账号在某系统的权限
export function getAccountSystemPermissions(accountId, systemId) {
  return request({
    url: `/accounts/${accountId}/systems/${systemId}`,
    method: 'get',
  })
}
