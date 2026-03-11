const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

// 获取日志列表
router.get('/', logController.getLogs);

// 导出日志
router.get('/export', logController.exportLogs);

module.exports = router;
