// MongoDB 初始化脚本
// 用于创建基础测试数据
// 使用方法：mongosh < 此文件路径

// 切换到项目数据库（会自动创建）
use permission_manager

// ========================================
// 1. 创建第一个系统
// ========================================
print("\n=== 创建系统 ===");

var system = db.systems.insertOne({
  name: "OA 办公系统",
  code: "oa",
  description: "公司办公自动化系统",
  status: 1,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✓ 系统已创建，ID: " + system.insertedId);

// ========================================
// 2. 创建权限
// ========================================
print("\n=== 创建权限 ===");

// 用户管理 - 菜单权限
var userMenu = db.permissions.insertOne({
  systemId: system.insertedId,
  name: "用户管理",
  code: "user",
  type: "menu",
  parentId: null,
  sort: 1,
  status: 1,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 用户管理 - 查看按钮
db.permissions.insertOne({
  systemId: system.insertedId,
  name: "用户查看",
  code: "user:view",
  type: "button",
  parentId: userMenu.insertedId,
  sort: 1,
  status: 1,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 用户管理 - 新增按钮
db.permissions.insertOne({
  systemId: system.insertedId,
  name: "用户新增",
  code: "user:add",
  type: "button",
  parentId: userMenu.insertedId,
  sort: 2,
  status: 1,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 用户管理 - 编辑按钮
db.permissions.insertOne({
  systemId: system.insertedId,
  name: "用户编辑",
  code: "user:edit",
  type: "button",
  parentId: userMenu.insertedId,
  sort: 3,
  status: 1,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 用户管理 - 删除按钮
db.permissions.insertOne({
  systemId: system.insertedId,
  name: "用户删除",
  code: "user:delete",
  type: "button",
  parentId: userMenu.insertedId,
  sort: 4,
  status: 1,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✓ 权限已创建");

// ========================================
// 3. 创建角色
// ========================================
print("\n=== 创建角色 ===");

var role = db.roles.insertOne({
  systemId: system.insertedId,
  name: "管理员",
  code: "admin",
  description: "系统管理员角色",
  permissions: [
    userMenu.insertedId,
    db.permissions.findOne({code: "user:view"})._id,
    db.permissions.findOne({code: "user:add"})._id,
    db.permissions.findOne({code: "user:edit"})._id,
    db.permissions.findOne({code: "user:delete"})._id
  ],
  status: 1,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✓ 角色已创建，ID: " + role.insertedId);

// ========================================
// 4. 创建第一个管理员账号
// ========================================
print("\n=== 创建管理员账号 ===");

// 注意：这里只创建账号，密码需要在应用中通过 bcrypt 加密
// 所以建议使用应用提供的注册接口创建账号

var adminAccount = db.accounts.insertOne({
  username: "admin",
  email: "admin@example.com",
  phone: "",
  status: 1,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✓ 管理员账号已创建，ID: " + adminAccount.insertedId);
print("⚠ 注意：请使用应用注册接口设置密码");

// ========================================
// 5. 分配角色给账号
// ========================================
print("\n=== 分配角色 ===");

db.accountsystems.insertOne({
  accountId: adminAccount.insertedId,
  systemId: system.insertedId,
  roleId: role.insertedId,
  extraPermissions: [],
  deniedPermissions: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✓ 角色已分配");

// ========================================
// 完成
// ========================================
print("\n========================================");
print("  数据库初始化完成！");
print("========================================");
print("\n已创建:");
print("  - 系统：OA 办公系统");
print("  - 权限：5 个（用户管理菜单 +4 个按钮）");
print("  - 角色：管理员");
print("  - 账号：admin");
print("\n下一步:");
print("  1. 启动后端服务");
print("  2. 使用注册接口设置 admin 密码");
print("  3. 登录系统测试功能");
print("========================================\n");
