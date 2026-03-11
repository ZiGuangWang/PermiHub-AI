const OperationLog = require('../models/OperationLog');

/**
 * 获取操作日志列表
 */
const getLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      operatorId, 
      systemId, 
      action, 
      targetType,
      startDate,
      endDate,
      keyword 
    } = req.query;
    
    const query = {};
    
    if (operatorId) {
      query.operatorId = operatorId;
    }
    
    if (systemId) {
      query.systemId = systemId;
    }
    
    if (action) {
      query.action = action;
    }
    
    if (targetType) {
      query.targetType = targetType;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    if (keyword) {
      query.$or = [
        { operatorName: { $regex: keyword, $options: 'i' } },
        { targetName: { $regex: keyword, $options: 'i' } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const [logs, total] = await Promise.all([
      OperationLog.find(query)
        .populate('operatorId', 'username email')
        .populate('systemId', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OperationLog.countDocuments(query),
    ]);
    
    res.json({
      code: 200,
      data: {
        list: logs.map(log => ({
          _id: log._id,
          operatorId: log.operatorId?._id || log.operatorId,
          operatorName: log.operatorName,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          targetName: log.targetName,
          systemId: log.systemId?._id || log.systemId,
          systemName: log.systemId?.name,
          beforeChange: log.beforeChange,
          afterChange: log.afterChange,
          ip: log.ip,
          userAgent: log.userAgent,
          createdAt: log.createdAt,
        })),
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error('获取操作日志失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取操作日志失败',
    });
  }
};

/**
 * 导出操作日志（CSV 格式）
 */
const exportLogs = async (req, res) => {
  try {
    const { 
      operatorId, 
      systemId, 
      action, 
      targetType,
      startDate,
      endDate,
    } = req.query;
    
    const query = {};
    
    if (operatorId) {
      query.operatorId = operatorId;
    }
    
    if (systemId) {
      query.systemId = systemId;
    }
    
    if (action) {
      query.action = action;
    }
    
    if (targetType) {
      query.targetType = targetType;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    const logs = await OperationLog.find(query)
      .populate('operatorId', 'username')
      .populate('systemId', 'name')
      .sort({ createdAt: -1 })
      .limit(10000); // 限制导出数量
    
    // 生成 CSV
    const headers = ['操作时间', '操作人', '操作类型', '目标类型', '目标名称', '系统', 'IP 地址'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString('zh-CN'),
      log.operatorName,
      log.action,
      log.targetType,
      log.targetName,
      log.systemId?.name || '-',
      log.ip || '-',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=operation_logs_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('导出日志失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '导出日志失败',
    });
  }
};

module.exports = {
  getLogs,
  exportLogs,
};
