const bcrypt = require('bcryptjs');

/**
 * 哈希密码
 * @param {String} password - 明文密码
 * @returns {Promise<String>} 加密后的密码
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * 验证密码
 * @param {String} password - 明文密码
 * @param {String} hash - 加密后的密码
 * @returns {Promise<Boolean>} 验证结果
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
