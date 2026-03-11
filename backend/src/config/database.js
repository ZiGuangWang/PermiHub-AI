const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('正在连接 MongoDB...');
    console.log(`连接字符串：${process.env.MONGODB_URI}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ 不再需要这些选项，但保留以防兼容性问题
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('========================================');
    console.log('✓ MongoDB 连接成功！');
    console.log(`  主机：${conn.connection.host}`);
    console.log(`  端口：${conn.connection.port}`);
    console.log(`  数据库：${conn.connection.name}`);
    console.log(`  状态：${conn.readyState === 1 ? '已连接' : '连接中'}`);
    console.log('========================================');
  } catch (error) {
    console.error('========================================');
    console.error('✗ MongoDB 连接失败！');
    console.error(`  错误信息：${error.message}`);
    console.error(`  错误代码：${error.code || 'UNKNOWN'}`);
    console.error('========================================');
    console.error('');
    console.error('请检查：');
    console.error('  1. MongoDB 服务是否已启动');
    console.error('  2. backend/.env 中的 MONGODB_URI 配置是否正确');
    console.error('  3. 网络连接是否正常');
    console.error('========================================');
    process.exit(1);
  }
};

module.exports = connectDB;
