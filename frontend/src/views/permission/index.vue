<template>
  <div class="permission-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增权限
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
            placeholder="权限名称/编码"
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
      <el-table :data="tableData" border stripe row-key="_id" v-loading="loading">
        <el-table-column prop="name" label="权限名称" />
        <el-table-column prop="code" label="权限编码" />
        <el-table-column label="权限类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'menu' ? 'primary' : row.type === 'button' ? 'warning' : 'info'">
              {{ typeMap[row.type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
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
        label-width="100px"
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
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入权限编码（如：user:view）" />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
            <el-radio label="api">接口</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPermissions, createPermission, updatePermission, deletePermission } from '@/api/permission'
import { getSystems } from '@/api/system'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增权限')
const formRef = ref(null)

const typeMap = {
  menu: '菜单',
  button: '按钮',
  api: '接口',
}

const searchForm = reactive({
  systemId: '',
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
  systemId: '',
  name: '',
  code: '',
  type: 'menu',
  sort: 0,
  status: 1,
})

const rules = {
  systemId: [{ required: true, message: '请选择所属系统', trigger: 'change' }],
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { pattern: /^[a-z0-9:_]+$/, message: '编码只能包含小写字母、数字、冒号和下划线', trigger: 'blur' },
  ],
}

const systemOptions = ref([])

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
    const res = await getPermissions({
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

const handleReset = () => {
  searchForm.systemId = ''
  searchForm.keyword = ''
  searchForm.status = null
  pagination.page = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增权限'
  form._id = null
  form.systemId = ''
  form.name = ''
  form.code = ''
  form.type = 'menu'
  form.sort = 0
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑权限'
  form._id = row._id
  form.systemId = row.systemId?._id || row.systemId
  form.name = row.name
  form.code = row.code
  form.type = row.type
  form.sort = row.sort
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
          type: form.type,
          sort: form.sort,
          status: form.status,
        }
        
        if (form._id) {
          await updatePermission(form._id, data)
          ElMessage.success('更新成功')
        } else {
          await createPermission(data)
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

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除权限"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deletePermission(row._id)
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
.permission-page {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
