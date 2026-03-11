import request from '@/utils/request'

// 获取操作日志列表
export function getLogs(params) {
  return request({
    url: '/logs',
    method: 'get',
    params,
  })
}

// 导出日志
export function exportLogs(params) {
  return request({
    url: '/logs/export',
    method: 'get',
    params,
    responseType: 'blob',
  })
}
