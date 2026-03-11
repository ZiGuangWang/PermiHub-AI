const { getTokenFromHeader, verifyToken } = require('../utils/jwt');
const Account = require('../models/Account');

/**
 * JWT 认证中间件
 * 验证请求头中的 Token 是否有效，并将用户信息附加到请求对象
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取 Token
    const token = getTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌',
      });
    }
    
    // 验证 Token
    const decoded = verifyToken(token);
    
    // 查找用户
    const user = await Account.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在',
      });
    }
    
    if (user.status === 0) {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用',
      });
    }
    
    // 将用户信息附加到请求对象
    req.user = user;
    req.userId = user._id.toString();
    
    next();
  } catch (error) {
    if (error.message === 'Token 验证失败' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: '无效的认证令牌',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '认证令牌已过期',
      });
    }
    
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

module.exports = authMiddleware;
