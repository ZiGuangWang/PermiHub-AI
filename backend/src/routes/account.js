const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

// 获取账号列表
router.get('/', accountController.getAccounts);

// 获取账号详情
router.get('/:id', accountController.getAccountById);

// 创建账号
router.post('/', accountController.createAccount);

// 更新账号
router.put('/:id', accountController.updateAccount);

// 重置密码
router.put('/:id/password', accountController.resetPassword);

// 删除账号
router.delete('/:id', accountController.deleteAccount);

// 分配账号角色
router.put('/:id/role', accountController.assignRole);

// 调整账号权限
router.put('/:id/permissions', accountController.adjustPermissions);

// 获取账号在某系统的权限
router.get('/:accountId/systems/:systemId', accountController.getAccountSystemPermissions);

module.exports = router;
