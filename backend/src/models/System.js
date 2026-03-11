const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '系统名称不能为空'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, '系统编码不能为空'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
}, {
  timestamps: true,
});

// 创建索引
systemSchema.index({ code: 1 });
systemSchema.index({ status: 1 });

module.exports = mongoose.model('System', systemSchema);
