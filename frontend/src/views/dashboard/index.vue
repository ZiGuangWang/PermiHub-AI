<template>
  <div class="dashboard">
    <el-card>
      <h2>欢迎使用权限管理系统</h2>
      <p class="description">
        本系统用于精细化管理账号在多个系统中的功能权限
      </p>
      
      <el-row :gutter="20" style="margin-top: 40px">
        <el-col :span="6">
          <el-statistic title="系统数量" :value="systemCount" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="权限数量" :value="permissionCount" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="角色数量" :value="roleCount" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="账号数量" :value="accountCount" />
        </el-col>
      </el-row>

      <el-divider />

      <h3>快速入口</h3>
      <el-space wrap>
        <el-button type="primary" @click="$router.push('/system')">
          <el-icon><Setting /></el-icon>
          系统管理
        </el-button>
        <el-button type="success" @click="$router.push('/permission')">
          <el-icon><Lock /></el-icon>
          权限管理
        </el-button>
        <el-button type="warning" @click="$router.push('/role')">
          <el-icon><UserFilled /></el-icon>
          角色管理
        </el-button>
        <el-button type="info" @click="$router.push('/account')">
          <el-icon><Users /></el-icon>
          账号管理
        </el-button>
        <el-button type="danger" @click="$router.push('/log')">
          <el-icon><Document /></el-icon>
          操作日志
        </el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSystems } from '@/api/system'
import { getPermissions } from '@/api/permission'
import { getRoles } from '@/api/role'
import { getAccounts } from '@/api/account'

const systemCount = ref(0)
const permissionCount = ref(0)
const roleCount = ref(0)
const accountCount = ref(0)

const loadData = async () => {
  try {
    const [systemRes, permissionRes, roleRes, accountRes] = await Promise.all([
      getSystems({ pageSize: 1 }),
      getPermissions({ pageSize: 1 }),
      getRoles({ pageSize: 1 }),
      getAccounts({ pageSize: 1 }),
    ])
    
    systemCount.value = systemRes.data.total || 0
    permissionCount.value = permissionRes.data.total || 0
    roleCount.value = roleRes.data.total || 0
    accountCount.value = accountRes.data.total || 0
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.description {
  color: #666;
  margin-top: 10px;
}

h3 {
  margin-top: 30px;
  margin-bottom: 20px;
}
</style>
