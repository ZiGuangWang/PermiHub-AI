const OperationLog = require('../models/OperationLog');

/**
 * 记录操作日志
 * @param {Object} options - 日志选项
 * @param {String} options.operatorId - 操作人 ID
 * @param {String} options.operatorName - 操作人姓名
 * @param {String} options.action - 操作类型
 * @param {String} options.targetType - 目标类型
 * @param {String} options.targetId - 目标 ID
 * @param {String} options.targetName - 目标名称
 * @param {String} [options.systemId] - 系统 ID
 * @param {Object} [options.beforeChange] - 变更前内容
 * @param {Object} [options.afterChange] - 变更后内容
 * @param {String} [options.ip] - IP 地址
 * @param {String} [options.userAgent] - 用户代理
 */
const logOperation = async ({
  operatorId,
  operatorName,
  action,
  targetType,
  targetId,
  targetName,
  systemId = null,
  beforeChange = null,
  afterChange = null,
  ip = '',
  userAgent = '',
}) => {
  try {
    await OperationLog.create({
      operatorId,
      operatorName,
      action,
      targetType,
      targetId,
      targetName,
      systemId,
      beforeChange,
      afterChange,
      ip,
      userAgent,
    });
  } catch (error) {
    console.error('记录操作日志失败:', error.message);
  }
};

module.exports = logOperation;
