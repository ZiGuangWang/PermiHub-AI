const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

// 获取角色列表
router.get('/', roleController.getRoles);

// 获取角色详情
router.get('/:id', roleController.getRoleById);

// 创建角色
router.post('/', roleController.createRole);

// 更新角色
router.put('/:id', roleController.updateRole);

// 分配角色权限
router.put('/:id/permissions', roleController.assignPermissions);

// 删除角色
router.delete('/:id', roleController.deleteRole);

module.exports = router;
