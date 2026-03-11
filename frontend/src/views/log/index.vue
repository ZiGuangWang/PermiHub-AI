<template>
  <div class="log-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出日志
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.action" placeholder="全部" clearable style="width: 150px">
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="分配权限" value="assign_permission" />
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标类型">
          <el-select v-model="searchForm.targetType" placeholder="全部" clearable style="width: 150px">
            <el-option label="账号" value="account" />
            <el-option label="角色" value="role" />
            <el-option label="权限" value="permission" />
            <el-option label="系统" value="system" />
            <el-option label="认证" value="auth" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="操作人/目标名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="120" />
        <el-table-column label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="actionTypeMap[row.action]?.type || 'info'">
              {{ actionTypeMap[row.action]?.label || row.action }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="目标类型" width="100">
          <template #default="{ row }">
            {{ targetTypeMap[row.targetType] || row.targetType }}
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="目标名称" />
        <el-table-column prop="systemName" label="所属系统" width="120">
          <template #default="{ row }">
            {{ row.systemName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="变更详情" min-width="200">
          <template #default="{ row }">
            <el-popover placement="top" trigger="click">
              <template #reference>
                <el-button type="primary" link>查看详情</el-button>
              </template>
              <div class="change-detail">
                <h5>变更前:</h5>
                <pre>{{ formatJson(row.beforeChange) }}</pre>
                <h5>变更后:</h5>
                <pre>{{ formatJson(row.afterChange) }}</pre>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP 地址" width="140" />
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLogs, exportLogs as exportLogsApi } from '@/api/log'

const loading = ref(false)

const actionTypeMap = {
  create: { label: '创建', type: 'success' },
  update: { label: '更新', type: 'warning' },
  delete: { label: '删除', type: 'danger' },
  assign_permission: { label: '分配权限', type: 'primary' },
  login: { label: '登录', type: 'info' },
  logout: { label: '登出', type: 'info' },
}

const targetTypeMap = {
  account: '账号',
  role: '角色',
  permission: '权限',
  system: '系统',
  auth: '认证',
}

const dateRange = ref([])

const searchForm = reactive({
  action: '',
  targetType: '',
  keyword: '',
})

const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

const loadData = async () => {
  loading.value = true
  
  const params = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    ...searchForm,
  }
  
  // 处理时间范围
  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = new Date(dateRange.value[0]).toISOString()
    params.endDate = new Date(dateRange.value[1]).toISOString()
  }
  
  try {
    const res = await getLogs(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  dateRange.value = []
  searchForm.action = ''
  searchForm.targetType = ''
  searchForm.keyword = ''
  pagination.page = 1
  loadData()
}

const handleExport = async () => {
  const params = {
    ...searchForm,
  }
  
  // 处理时间范围
  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = new Date(dateRange.value[0]).toISOString()
    params.endDate = new Date(dateRange.value[1]).toISOString()
  }
  
  try {
    const blob = await exportLogsApi(params)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `operation_logs_${Date.now()}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const formatJson = (obj) => {
  if (!obj) return '无'
  return JSON.stringify(obj, null, 2)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.log-page {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.change-detail {
  max-height: 400px;
  overflow-y: auto;
}

.change-detail h5 {
  margin: 10px 0 5px;
  color: #666;
}

.change-detail pre {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 优化下拉框样式 */
:deep(.el-select-dropdown) {
  min-width: 150px !important;
}

:deep(.el-select-dropdown__item) {
  min-width: 130px;
}
</style>
