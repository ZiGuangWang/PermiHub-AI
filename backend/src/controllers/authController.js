const { generateToken } = require('../utils/jwt');
const Account = require('../models/Account');
const logOperation = require('../utils/logger');

/**
 * 用户注册
 */
const register = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;
    console.log('请求到了', username)
    // 检查用户名是否已存在
    const existingAccount = await Account.findOne({ username });
    if (existingAccount) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在',
      });
    }
    
    // 创建账号
    const account = await Account.create({
      username,
      password,
      email,
      phone,
    });
    
    // 记录日志
    await logOperation({
      operatorId: account._id.toString(),
      operatorName: account.username,
      action: 'create',
      targetType: 'account',
      targetId: account._id.toString(),
      targetName: account.username,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.status(201).json({
      code: 200,
      data: {
        _id: account._id,
        username: account.username,
        email: account.email,
        phone: account.phone,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '注册失败',
    });
  }
};

/**
 * 用户登录
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找账号（包含密码字段）
    const account = await Account.findOne({ username }).select('+password');
    
    if (!account) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }
    
    // 验证密码
    const isMatch = await account.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }
    
    // 检查账号状态
    if (account.status === 0) {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用',
      });
    }
    
    // 生成 Token
    const token = generateToken({ userId: account._id.toString() });
    
    // 更新最后登录时间
    account.lastLoginAt = new Date();
    await account.save();
    
    // 记录日志
    await logOperation({
      operatorId: account._id.toString(),
      operatorName: account.username,
      action: 'login',
      targetType: 'auth',
      targetId: account._id.toString(),
      targetName: account.username,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      data: {
        token,
        user: {
          _id: account._id,
          username: account.username,
          email: account.email,
          phone: account.phone,
        },
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '登录失败',
    });
  }
};

/**
 * 获取当前用户信息
 */
const getMe = async (req, res) => {
  try {
    res.json({
      code: 200,
      data: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        phone: req.user.phone,
        status: req.user.status,
        lastLoginAt: req.user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取用户信息失败',
    });
  }
};

/**
 * 修改密码
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // 验证旧密码
    const account = await Account.findById(req.userId).select('+password');
    const isMatch = await account.comparePassword(oldPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        message: '原密码错误',
      });
    }
    
    // 更新密码
    account.password = newPassword;
    await account.save();
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'update',
      targetType: 'account',
      targetId: req.userId,
      targetName: req.user.username,
      beforeChange: { action: 'change_password' },
      afterChange: { action: 'password_changed' },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      message: '密码修改成功',
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '修改密码失败',
    });
  }
};

/**
 * 登出
 */
const logout = async (req, res) => {
  try {
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'logout',
      targetType: 'auth',
      targetId: req.userId,
      targetName: req.user.username,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      message: '登出成功',
    });
  } catch (error) {
    console.error('登出失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '登出失败',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  logout,
};
