const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// 注册（公开）
router.post('/register', authController.register);

// 登录（公开）
router.post('/login', authController.login);

// 以下接口需要认证
router.use(authMiddleware);

// 获取当前用户信息
router.get('/me', authController.getMe);

// 修改密码
router.put('/password', authController.changePassword);

// 登出
router.post('/logout', authController.logout);

module.exports = router;
