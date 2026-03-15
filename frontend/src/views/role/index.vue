<template>
  <div class="role-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="系统">
          <el-select
            v-model="searchForm.systemId"
            placeholder="选择系统"
            clearable
            @change="loadData"
            style="width: 150px"
          >
            <el-option
              v-for="item in systemOptions"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="角色名称/编码"
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
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色编码" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="权限数量" width="100">
          <template #default="{ row }">
            {{ row.permissions?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handlePermissions(row)">
              分配权限
            </el-button>
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
        <el-form-item label="所属系统" prop="systemId">
          <el-select v-model="form.systemId" placeholder="请选择系统" style="width: 100%">
            <el-option
              v-for="item in systemOptions"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色编码（英文）" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
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

    <!-- 分配权限对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="分配权限"
      width="600px"
    >
      <el-tree
        ref="permissionTreeRef"
        :data="permissionTree"
        :props="{ children: 'children', label: 'name' }"
        show-checkbox
        node-key="_id"
        :default-checked-keys="selectedPermissions"
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoles, createRole, updateRole, deleteRole, assignPermissions } from '@/api/role'
import { getSystems } from '@/api/system'
import { getPermissionTree } from '@/api/permission'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formRef = ref(null)
const permissionDialogVisible = ref(false)
const permissionTreeRef = ref(null)

const currentRoleId = ref(null)

const searchForm = reactive({
  systemId: '',
  keyword: '',
})

const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

const form = reactive({
  _id: null,
  systemId: '',
  name: '',
  code: '',
  description: '',
  status: 1,
})

const rules = {
  systemId: [{ required: true, message: '请选择所属系统', trigger: 'change' }],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-z0-9_]+$/, message: '编码只能包含小写字母、数字和下划线', trigger: 'blur' },
  ],
}

const systemOptions = ref([])
const permissionTree = ref([])
const selectedPermissions = ref([])

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
    const res = await getRoles({
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

const loadPermissionTree = async (systemId) => {
  try {
    const res = await getPermissionTree({ systemId })
    permissionTree.value = res.data
  } catch (error) {
    console.error('加载权限树失败:', error)
  }
}

const handleReset = () => {
  searchForm.systemId = ''
  searchForm.keyword = ''
  pagination.page = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增角色'
  form._id = null
  form.systemId = ''
  form.name = ''
  form.code = ''
  form.description = ''
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  form._id = row._id
  form.systemId = row.systemId?._id || row.systemId
  form.name = row.name
  form.code = row.code
  form.description = row.description || ''
  form.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          systemId: form.systemId,
          name: form.name,
          code: form.code,
          description: form.description,
          status: form.status,
        }
        
        if (form._id) {
          await updateRole(form._id, data)
          ElMessage.success('更新成功')
        } else {
          await createRole(data)
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

const handlePermissions = async (row) => {
  currentRoleId.value = row._id
  selectedPermissions.value = row.permissions?.map(p => p._id) || []
  
  await loadPermissionTree(row.systemId?._id || row.systemId)
  permissionDialogVisible.value = true
}

const handleSavePermissions = async () => {
  const checkedKeys = permissionTreeRef.value.getCheckedKeys(false)
  const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
  const permissions = Array.from(new Set([...(checkedKeys || []), ...(halfCheckedKeys || [])]))
  
  try {
    await assignPermissions(currentRoleId.value, {
      permissions,
    })
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('分配权限失败:', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteRole(row._id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

onMounted(() => {
  loadSystems()
  loadData()
})
</script>

<style scoped>
.role-page {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
