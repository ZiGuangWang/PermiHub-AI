const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  systemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'System',
    required: [true, '所属系统不能为空'],
  },
  name: {
    type: String,
    required: [true, '权限名称不能为空'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, '权限编码不能为空'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['menu', 'button', 'api'],
    default: 'menu',
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    default: null,
  },
  sort: {
    type: Number,
    default: 0,
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
}, {
  timestamps: true,
});

// 创建复合索引，确保同一系统下权限编码唯一
permissionSchema.index({ systemId: 1, code: 1 }, { unique: true });
permissionSchema.index({ systemId: 1, parentId: 1 });
permissionSchema.index({ status: 1 });

module.exports = mongoose.model('Permission', permissionSchema);
