const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

// 获取系统列表
router.get('/', systemController.getSystems);

// 获取系统详情
router.get('/:id', systemController.getSystemById);

// 创建系统
router.post('/', systemController.createSystem);

// 更新系统
router.put('/:id', systemController.updateSystem);

// 删除系统
router.delete('/:id', systemController.deleteSystem);

module.exports = router;
