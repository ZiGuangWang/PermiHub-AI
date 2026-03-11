const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

// 获取权限列表
router.get('/', permissionController.getPermissions);

// 获取权限树
router.get('/tree', permissionController.getPermissionTree);

// 获取权限详情
router.get('/:id', permissionController.getPermissionById);

// 创建权限
router.post('/', permissionController.createPermission);

// 更新权限
router.put('/:id', permissionController.updatePermission);

// 删除权限
router.delete('/:id', permissionController.deletePermission);

module.exports = router;
