# 多系统权限管理系统

基于 Vue 3 + Element Plus + Node.js + MongoDB 的多系统权限管理系统，支持跨系统的角色和权限管理。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16-green.svg)
![Vue](https://img.shields.io/badge/vue-3.5-green.svg)
![Express](https://img.shields.io/badge/express-4.18-green.svg)

## 📖 目录

- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [核心概念](#-核心概念)
- [API 接口](#-api-接口)
- [常见问题](#-常见问题)

---

## ✨ 功能特性

### 核心功能
- ✅ **多系统管理** - 支持管理多个独立系统
- ✅ **权限管理** - 菜单、按钮、API 三级权限控制
- ✅ **角色管理** - 按系统分配角色，批量设置权限
- ✅ **账号管理** - 用户账号 CRUD，支持个性化权限调整
- ✅ **权限分配** - 额外授予/拒绝特定权限
- ✅ **操作日志** - 完整记录所有操作，支持导出 Excel

### 权限模型
```
最终权限 = (角色权限 ∪ 额外授予权限) - 拒绝权限
```

**优先级**：拒绝权限 > 角色权限 = 额外授予权限

---

## 🛠️ 技术栈

| 后端 | 前端 |
|------|------|
| Node.js 16+ | Vue 3.5+ |
| Express 4.18 | Element Plus 2.13 |
| MongoDB 6.0+ | Pinia 3.0 |
| Mongoose 8.0 | Vue Router 5.0 |
| JWT 9.0 | Axios 1.13 |
| bcryptjs 2.4 | Vite 7.3 |

---

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 16
- MongoDB >= 6.0

### 2. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 3. 配置环境变量

**后端** (`backend/.env`)：
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/permission_manager
JWT_SECRET=your-random-secret-key-at-least-32-chars
JWT_EXPIRES_IN=24h
LOG_LEVEL=info
```

**前端** (`frontend/.env`)：
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. 启动服务

```bash
# 窗口 1：启动后端
cd backend
npm run dev

# 窗口 2：启动前端
cd frontend
npm run dev
```

- 后端访问：http://localhost:3000
- 前端访问：http://localhost:5173

### 5. 创建管理员账号

浏览器打开 `http://localhost:5173`，按 F12 执行：

```javascript
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'Admin@123',
    email: 'admin@example.com'
  })
}).then(r => r.json()).then(console.log)
```

### 6. 登录系统

- 用户名：`admin`
- 密码：`Admin@123`

---

## 📁 项目结构

```
permission-manager/
├── backend/                      # 后端服务
│   ├── src/
│   │   ├── config/              # 配置文件
│   │   ├── models/              # 数据模型（6 个）
│   │   ├── controllers/         # 控制器（6 个）
│   │   ├── routes/              # API 路由（6 个）
│   │   ├── middleware/          # 中间件
│   │   └── utils/               # 工具函数
│   ├── .env                     # 环境变量 ⚠️ 不提交
│   └── package.json
│
├── frontend/                     # 前端应用
│   ├── src/
│   │   ├── api/                 # API 封装
│   │   ├── views/               # 页面组件（7 个）
│   │   ├── router/              # 路由配置
│   │   ├── store/               # 状态管理
│   │   └── utils/               # 工具函数
│   ├── .env                     # 环境变量 ⚠️ 不提交
│   └── package.json
│
└── README.md                     # 项目文档
```

---

## 🗂️ 数据模型

### 1. System（系统）
管理独立的子系统，如 OA、CRM、ERP 等。

```javascript
{
  name: String,          // 系统名称
  code: String,          // 系统编码（唯一）
  description: String,   // 描述
  status: Number         // 0-禁用，1-启用
}
```

### 2. Permission（权限）
树形结构的权限定义，支持菜单、按钮、API 三种类型。

```javascript
{
  systemId: ObjectId,    // 所属系统
  name: String,          // 权限名称
  code: String,          // 权限编码（系统内唯一）
  type: String,          // menu|button|api
  parentId: ObjectId,    // 父权限 ID
  sort: Number           // 排序
}
```

### 3. Role（角色）
角色的权限集合，按系统隔离。

```javascript
{
  systemId: ObjectId,    // 所属系统
  name: String,          // 角色名称
  code: String,          // 角色编码（系统内唯一）
  permissions: [ObjectId] // 权限 ID 数组
}
```

### 4. Account（账号）
用户账号，密码使用 bcrypt 加密。

```javascript
{
  username: String,      // 用户名（唯一）
  password: String,      // bcrypt 加密
  email: String,         // 邮箱
  phone: String,         // 电话
  status: Number,        // 0-禁用，1-启用
  lastLoginAt: Date      // 最后登录时间
}
```

### 5. AccountSystem（账号 - 系统关联）
账号在某个系统中的角色和个性化权限配置。

```javascript
{
  accountId: ObjectId,   // 账号 ID
  systemId: ObjectId,    // 系统 ID
  roleId: ObjectId,      // 角色 ID
  extraPermissions: [ObjectId],  // 额外授予权限
  deniedPermissions: [ObjectId]  // 拒绝权限
}
```

### 6. OperationLog（操作日志）
记录所有关键操作，支持审计追溯。

```javascript
{
  operatorId: ObjectId,  // 操作人 ID
  operatorName: String,  // 操作人姓名
  action: String,        // 操作类型
  targetType: String,    // 目标类型
  targetId: String,      // 目标 ID
  targetName: String,    // 目标名称
  systemId: ObjectId,    // 所属系统
  beforeChange: Object,  // 变更前数据
  afterChange: Object,   // 变更后数据
  ip: String,            // IP 地址
  createdAt: Date        // 操作时间
}
```

---

## 🔌 API 接口

### 认证模块 `/api/auth`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/register` | 注册账号 |
| POST | `/login` | 登录 |
| GET | `/me` | 获取当前用户信息 |

### 系统管理 `/api/systems`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 获取系统列表 |
| GET | `/:id` | 获取系统详情 |
| POST | `/` | 创建系统 |
| PUT | `/:id` | 更新系统 |
| DELETE | `/:id` | 删除系统 |

### 权限管理 `/api/permissions`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 获取权限列表 |
| GET | `/tree/:systemId` | 获取权限树 |
| POST | `/` | 创建权限 |
| PUT | `/:id` | 更新权限 |
| DELETE | `/:id` | 删除权限 |

### 角色管理 `/api/roles`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 获取角色列表 |
| GET | `/:id` | 获取角色详情 |
| POST | `/` | 创建角色 |
| PUT | `/:id` | 更新角色 |
| DELETE | `/:id` | 删除角色 |
| PUT | `/:id/permissions` | 分配权限 |

### 账号管理 `/api/accounts`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 获取账号列表 |
| GET | `/:id` | 获取账号详情 |
| POST | `/` | 创建账号 |
| PUT | `/:id` | 更新账号 |
| PUT | `/:id/password` | 重置密码 |
| DELETE | `/:id` | 删除账号 |
| PUT | `/:id/role` | 分配角色 |
| PUT | `/:id/permissions` | 调整权限 |
| GET | `/:accountId/system/:systemId/permissions` | 获取账号权限 |

### 日志管理 `/api/logs`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 获取日志列表 |
| GET | `/export` | 导出日志 Excel |

---

## 💡 核心概念

### RBAC 权限模型

本系统采用 **RBAC（Role-Based Access Control）** 权限模型：

1. **用户（Account）** - 系统使用者
2. **角色（Role）** - 权限的集合
3. **权限（Permission）** - 具体的操作授权

**关系**：用户 → 角色 → 权限

### 多系统架构

```
┌─────────────────────────────────────┐
│         账号 (Account)              │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ 系统 A 配置   │  │ 系统 B 配置   │  │
│  │ - 角色：经理  │  │ - 角色：员工  │  │
│  │ - 额外权限   │  │ - 拒绝权限   │  │
│  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────┘
```

每个系统有独立的角色和权限体系，互不影响。

### 权限计算公式

```
最终权限 = (角色权限 ∪ 额外授予权限) - 拒绝权限
```

**示例场景**：

| 场景 | 角色权限 | 额外授予 | 拒绝 | 最终权限 |
|------|---------|---------|------|---------|
| 普通用户 | [查看] | - | - | [查看] |
| 临时授权 | [查看] | [导出] | - | [查看，导出] |
| 受限管理员 | [查看，编辑，删除] | - | [删除] | [查看，编辑] |

---

## ❓ 常见问题

### MongoDB 未启动

**Windows:**
```bash
sc query MongoDB
net start MongoDB
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 端口被占用

修改 `backend/.env`：
```env
PORT=3001  # 改为其他可用端口
```

### 依赖安装失败

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### CORS 错误

确保后端已启动且 `.env` 配置正确：
```env
MONGODB_URI=mongodb://localhost:27017/permission_manager
```

### 忘记密码

使用 admin 账号登录，在"账号管理"中找到对应账号，点击"重置密码"。

---

## 🔒 安全建议

### 生产环境部署

1. **修改 JWT 密钥**
   ```bash
   # backend/.env
   JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **启用 MongoDB 认证**
   ```bash
   MONGODB_URI=mongodb://user:password@host:27017/dbname
   ```

3. **配置 HTTPS**

4. **限制 CORS 白名单**

5. **定期备份数据库**

6. **不要提交 .env 文件到 Git**

---

## 📄 License

MIT

---

## 👥 开发指南

### 添加新的 API 接口

**后端：**

1. 在 `routes/xxx.js` 添加路由
2. 在 `controllers/xxx.js` 实现逻辑
3. 使用 `authMiddleware` 保护接口

**前端：**

1. 在 `src/api/xxx.js` 封装 API 调用
2. 在页面组件中引入使用

### 调试技巧

**后端调试：**
```bash
# 查看详细日志
cd backend
set LOG_LEVEL=debug  # Windows
export LOG_LEVEL=debug  # Linux/Mac
npm run dev
```

**前端调试：**
- 按 F12 打开开发者工具
- 使用 Network 面板查看 API 请求
- 使用 Console 查看日志输出

---

**祝你使用愉快！** 🎉

如有问题，请查看控制台日志或提交 Issue。
