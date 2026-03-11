const mongoose = require('mongoose');

const operationLogSchema = new mongoose.Schema({
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  operatorName: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'assign_permission', 'login', 'logout'],
  },
  targetType: {
    type: String,
    required: true,
    enum: ['account', 'role', 'permission', 'system', 'auth'],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  targetName: {
    type: String,
    required: true,
  },
  systemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'System',
  },
  beforeChange: {
    type: Object,
    default: null,
  },
  afterChange: {
    type: Object,
    default: null,
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

// 创建索引以支持常用查询
operationLogSchema.index({ createdAt: -1 });
operationLogSchema.index({ operatorId: 1, createdAt: -1 });
operationLogSchema.index({ targetType: 1, targetId: 1 });
operationLogSchema.index({ systemId: 1, createdAt: -1 });
operationLogSchema.index({ action: 1 });

module.exports = mongoose.model('OperationLog', operationLogSchema);
