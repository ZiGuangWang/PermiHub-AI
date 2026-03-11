const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 生成 JWT Token
 * @param {Object} payload - Token 载荷
 * @returns {String} JWT Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * 验证 JWT Token
 * @param {String} token - JWT Token
 * @returns {Object} 解码后的 payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Token 验证失败');
  }
};

/**
 * 从请求头获取 Token
 * @param {Object} req - Express 请求对象
 * @returns {String|null} Token 或 null
 */
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
};

module.exports = {
  generateToken,
  verifyToken,
  getTokenFromHeader,
};
