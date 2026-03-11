import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref([])

  // 设置权限
  function setPermissions(perms) {
    permissions.value = perms
  }

  // 检查是否有某个权限
  function hasPermission(code) {
    return permissions.value.includes(code)
  }

  // 清空权限
  function clearPermissions() {
    permissions.value = []
  }

  return {
    permissions,
    setPermissions,
    hasPermission,
    clearPermissions,
  }
})
