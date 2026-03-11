require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config');
const connectDB = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const systemRoutes = require('./routes/system');
const permissionRoutes = require('./routes/permission');
const roleRoutes = require('./routes/role');
const accountRoutes = require('./routes/account');
const logRoutes = require('./routes/log');

// 连接数据库
connectDB();

// 创建 Express 应用
const app = express();

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域支持
app.use(compression()); // Gzip 压缩
app.use(morgan('combined')); // HTTP 日志
app.use(express.json({ limit: '10mb' })); // JSON 解析
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL 编码解析

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/systems', systemRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/logs', logRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
  });
});

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  后端服务启动成功！');
  console.log('========================================');
  console.log(`  端口：${PORT}`);
  console.log(`  环境：${config.nodeEnv}`);
  console.log(`  时间：${new Date().toLocaleString('zh-CN')}`);
  console.log('');
  console.log('  API 接口:');
  console.log(`    认证：http://localhost:${PORT}/api/auth`);
  console.log(`    系统：http://localhost:${PORT}/api/systems`);
  console.log(`    权限：http://localhost:${PORT}/api/permissions`);
  console.log(`    角色：http://localhost:${PORT}/api/roles`);
  console.log(`    账号：http://localhost:${PORT}/api/accounts`);
  console.log(`    日志：http://localhost:${PORT}/api/logs`);
  console.log('');
  console.log(`  健康检查：http://localhost:${PORT}/health`);
  console.log('========================================');
  console.log('');
});

module.exports = app;
