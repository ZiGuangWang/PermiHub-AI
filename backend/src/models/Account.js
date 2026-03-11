const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少 3 个字符'],
    maxlength: [50, '用户名最多 50 个字符'],
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少 6 个字符'],
    select: false, // 默认不返回密码字段
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, '请输入有效的邮箱地址'],
  },
  phone: {
    type: String,
    trim: true,
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
  lastLoginAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// 密码加密中间件
accountSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
accountSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 创建索引
accountSchema.index({ username: 1 });
accountSchema.index({ status: 1 });

module.exports = mongoose.model('Account', accountSchema);
