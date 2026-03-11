const mongoose = require('mongoose');

const accountSystemSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, '账号 ID 不能为空'],
  },
  systemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'System',
    required: [true, '系统 ID 不能为空'],
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null,
  },
  extraPermissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  deniedPermissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
}, {
  timestamps: true,
});

// 创建复合索引，确保同一账号在同一系统下只有一条记录
accountSystemSchema.index({ accountId: 1, systemId: 1 }, { unique: true });

module.exports = mongoose.model('AccountSystem', accountSystemSchema);
