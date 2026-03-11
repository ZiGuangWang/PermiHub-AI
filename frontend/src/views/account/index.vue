<template>
  <div class="account-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账号列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增账号
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/邮箱/手机号"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '从未登录' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleRole(row)">分配角色</el-button>
            <el-button type="warning" link @click="handlePermission(row)">权限调整</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!form._id" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form._id">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="500px"
    >
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="选择系统">
          <el-select v-model="roleForm.systemId" placeholder="请选择系统" style="width: 100%" @change="handleSystemChange">
            <el-option
              v-for="item in systemOptions"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择角色">
          <el-select v-model="roleForm.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="item in roleOptions"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRole">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限调整对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限调整"
      width="700px"
      @close="handlePermissionDialogClose"
    >
      <el-form :model="permissionForm" label-width="100px">
        <el-form-item label="选择系统">
          <el-select v-model="permissionForm.systemId" placeholder="请选择系统" style="width: 100%" @change="handlePermSystemChange">
            <el-option
              v-for="item in systemOptions"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
        
        <el-divider>当前权限信息</el-divider>
        
        <el-descriptions :column="2" border v-if="permissionInfo.roleName">
          <el-descriptions-item label="当前角色">{{ permissionInfo.roleName }}</el-descriptions-item>
          <el-descriptions-item label="角色权限数">{{ permissionInfo.rolePermissions?.length || 0 }}</el-descriptions-item>
          <el-descriptions-item label="额外权限数">{{ permissionInfo.extraPermissions?.length || 0 }}</el-descriptions-item>
          <el-descriptions-item label="拒绝权限数">{{ permissionInfo.deniedPermissions?.length || 0 }}</el-descriptions-item>
          <el-descriptions-item label="最终权限数" :span="2">{{ permissionInfo.finalPermissions?.length || 0 }}</el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="该账号在此系统下未分配角色" />
        
        <el-divider>权限调整</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <h4>额外授予权限</h4>
            <el-tree
              ref="extraTreeRef"
              :data="filteredExtraTree"
              :props="{ children: 'children', label: 'name' }"
              show-checkbox
              node-key="_id"
              :default-checked-keys="permissionForm.extraPermissions"
            />
          </el-col>
          <el-col :span="12">
            <h4>拒绝权限</h4>
            <el-tree
              ref="deniedTreeRef"
              :data="filteredDeniedTree"
              :props="{ children: 'children', label: 'name' }"
              show-checkbox
              node-key="_id"
              :default-checked-keys="permissionForm.deniedPermissions"
            />
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAccounts, createAccount, updateAccount, deleteAccount, assignRole, adjustPermissions, getAccountSystemPermissions } from '@/api/account'
import { getSystems } from '@/api/system'
import { getRoles } from '@/api/role'
import { getPermissionTree } from '@/api/permission'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增账号')
const formRef = ref(null)
const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const extraTreeRef = ref(null)
const deniedTreeRef = ref(null)

const currentAccountId = ref(null)

const searchForm = reactive({
  keyword: '',
  status: null,
})

const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

const form = reactive({
  _id: null,
  username: '',
  password: '',
  email: '',
  phone: '',
  status: 1,
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度 3-50 位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
}

const systemOptions = ref([])
const roleOptions = ref([])

const roleForm = reactive({
  systemId: '',
  roleId: '',
})

const permissionForm = reactive({
  systemId: '',
  extraPermissions: [],
  deniedPermissions: [],
})

const permissionInfo = ref({})
const permissionTree = ref([])
const filteredExtraTree = ref([]) // 额外授予权限树（过滤掉角色已有权限）
const filteredDeniedTree = ref([]) // 拒绝权限树（只显示角色已有权限）

const loadSystems = async () => {
  try {
    const res = await getSystems({ pageSize: 100 })
    systemOptions.value = res.data.list.filter(s => s.status === 1)
  } catch (error) {
    console.error('加载系统列表失败:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAccounts({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadRoles = async (systemId) => {
  try {
    const res = await getRoles({ systemId, pageSize: 100 })
    roleOptions.value = res.data.list.filter(r => r.status === 1)
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

const loadPermissionTree = async (systemId) => {
  try {
    const res = await getPermissionTree({ systemId })
    permissionTree.value = res.data
  } catch (error) {
    console.error('加载权限树失败:', error)
  }
}

const loadAccountPermissions = async (accountId, systemId) => {
  try {
    const res = await getAccountSystemPermissions(accountId, systemId)
    permissionInfo.value = res.data
    permissionForm.extraPermissions = res.data.extraPermissions || []
    permissionForm.deniedPermissions = res.data.deniedPermissions || []
    
    // 过滤权限树
    filterPermissionTrees(res.data.rolePermissions || [])
  } catch (error) {
    console.error('加载账号权限失败:', error)
  }
}

/**
 * 过滤权限树
 * - 额外授予权限树：只显示角色没有的权限
 * - 拒绝权限树：只显示角色已有的权限
 */
const filterPermissionTrees = (rolePermissionIds) => {
  // 深拷贝权限树，避免修改原始数据
  const treeStr = JSON.stringify(permissionTree.value)
  const allPermissions = JSON.parse(treeStr)
  
  // 递归过滤树节点
  const filterTree = (nodes, keepFn) => {
    return nodes
      .map(node => {
        // 如果是叶子节点，根据条件保留
        if (!node.children || node.children.length === 0) {
          return keepFn(node) ? node : null
        }
        // 如果是父节点，递归过滤子节点
        const filteredChildren = filterTree(node.children, keepFn)
        // 如果子节点有保留的，保留父节点
        if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren }
        }
        // 否则保留父节点但无子节点（如果父节点本身也满足条件）
        return keepFn(node) ? { ...node, children: [] } : null
      })
      .filter(node => node !== null)
  }
  
  // 额外授予权限树：过滤掉角色已有的权限
  filteredExtraTree.value = filterTree(allPermissions, (node) => {
    return !rolePermissionIds.includes(node._id)
  })
  
  // 拒绝权限树：只显示角色已有的权限
  filteredDeniedTree.value = filterTree(allPermissions, (node) => {
    return rolePermissionIds.includes(node._id)
  })
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = null
  pagination.page = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增账号'
  form._id = null
  form.username = ''
  form.password = ''
  form.email = ''
  form.phone = ''
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑账号'
  form._id = row._id
  form.username = row.username
  form.password = ''
  form.email = row.email || ''
  form.phone = row.phone || ''
  form.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          username: form.username,
          email: form.email,
          phone: form.phone,
          status: form.status,
        }
        
        if (form.password) {
          data.password = form.password
        }
        
        if (form._id) {
          await updateAccount(form._id, data)
          ElMessage.success('更新成功')
        } else {
          await createAccount(data)
          ElMessage.success('创建成功')
        }
        
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}

const handleRole = (row) => {
  currentAccountId.value = row._id
  roleForm.systemId = ''
  roleForm.roleId = ''
  roleOptions.value = []
  roleDialogVisible.value = true
}

const handleSystemChange = () => {
  roleForm.roleId = ''
  loadRoles(roleForm.systemId)
}

const handleSaveRole = async () => {
  if (!roleForm.systemId || !roleForm.roleId) {
    ElMessage.warning('请选择系统和角色')
    return
  }
  
  try {
    await assignRole(currentAccountId.value, roleForm)
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
  } catch (error) {
    console.error('分配角色失败:', error)
  }
}

const handlePermission = async (row) => {
  currentAccountId.value = row._id
  permissionForm.systemId = ''
  permissionForm.extraPermissions = []
  permissionForm.deniedPermissions = []
  permissionInfo.value = {}
  permissionDialogVisible.value = true
}

const handlePermSystemChange = async () => {
  if (!permissionForm.systemId) return
  
  await loadPermissionTree(permissionForm.systemId)
  await loadAccountPermissions(currentAccountId.value, permissionForm.systemId)
}

const handlePermissionDialogClose = () => {
  // 清空系统选择
  permissionForm.systemId = ''
  // 清空权限选择
  permissionForm.extraPermissions = []
  permissionForm.deniedPermissions = []
  // 清空权限信息
  permissionInfo.value = {}
  // 清空权限树数据
  permissionTree.value = []
  filteredExtraTree.value = []
  filteredDeniedTree.value = []
  // 清空权限树选中状态
  if (extraTreeRef.value) {
    extraTreeRef.value.setCheckedKeys([])
  }
  if (deniedTreeRef.value) {
    deniedTreeRef.value.setCheckedKeys([])
  }
}

// 监听权限数据变化，实时更新 ElTree 选中状态
watch(() => permissionForm.extraPermissions, (newVal) => {
  if (extraTreeRef.value && newVal) {
    extraTreeRef.value.setCheckedKeys(newVal)
  }
}, { deep: true })

watch(() => permissionForm.deniedPermissions, (newVal) => {
  if (deniedTreeRef.value && newVal) {
    deniedTreeRef.value.setCheckedKeys(newVal)
  }
}, { deep: true })

const handleSavePermissions = async () => {
  const extraKeys = extraTreeRef.value?.getCheckedKeys(true) || []
  const deniedKeys = deniedTreeRef.value?.getCheckedKeys(true) || []
  
  try {
    await adjustPermissions(currentAccountId.value, {
      systemId: permissionForm.systemId,
      extraPermissions: extraKeys,
      deniedPermissions: deniedKeys,
    })
    ElMessage.success('权限调整成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('调整权限失败:', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除账号"${row.username}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteAccount(row._id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadSystems()
  loadData()
})
</script>

<style scoped>
.account-page {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h4 {
  margin-bottom: 10px;
  color: #333;
}
</style>
