const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  systemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'System',
    required: [true, '所属系统不能为空'],
  },
  name: {
    type: String,
    required: [true, '角色名称不能为空'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, '角色编码不能为空'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
}, {
  timestamps: true,
});

// 创建复合索引，确保同一系统下角色编码唯一
roleSchema.index({ systemId: 1, code: 1 }, { unique: true });
roleSchema.index({ status: 1 });

module.exports = mongoose.model('Role', roleSchema);
