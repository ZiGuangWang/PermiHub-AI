const System = require('../models/System');
const logOperation = require('../utils/logger');

/**
 * 获取系统列表（分页）
 */
const getSystems = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    
    const query = {};
    
    if (status !== undefined) {
      query.status = parseInt(status);
    }
    
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { code: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const [systems, total] = await Promise.all([
      System.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      System.countDocuments(query),
    ]);
    
    res.json({
      code: 200,
      data: {
        list: systems,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error('获取系统列表失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取系统列表失败',
    });
  }
};

/**
 * 获取系统详情
 */
const getSystemById = async (req, res) => {
  try {
    const system = await System.findById(req.params.id);
    
    if (!system) {
      return res.status(404).json({
        code: 404,
        message: '系统不存在',
      });
    }
    
    res.json({
      code: 200,
      data: system,
    });
  } catch (error) {
    console.error('获取系统详情失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取系统详情失败',
    });
  }
};

/**
 * 创建系统
 */
const createSystem = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;
    
    // 检查编码是否已存在
    const existing = await System.findOne({ code });
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: '系统编码已存在',
      });
    }
    
    const system = await System.create({
      name,
      code,
      description,
      status: status !== undefined ? status : 1,
    });
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'create',
      targetType: 'system',
      targetId: system._id,
      targetName: system.name,
      systemId: system._id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.status(201).json({
      code: 200,
      data: system,
    });
  } catch (error) {
    console.error('创建系统失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '创建系统失败',
    });
  }
};

/**
 * 更新系统
 */
const updateSystem = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;
    
    const oldSystem = await System.findById(req.params.id);
    
    if (!oldSystem) {
      return res.status(404).json({
        code: 404,
        message: '系统不存在',
      });
    }
    
    // 如果修改了编码，检查新编码是否已被使用
    if (code && code !== oldSystem.code) {
      const existing = await System.findOne({ code, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({
          code: 400,
          message: '系统编码已存在',
        });
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    
    const system = await System.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'update',
      targetType: 'system',
      targetId: system._id,
      targetName: system.name,
      systemId: system._id,
      beforeChange: {
        name: oldSystem.name,
        code: oldSystem.code,
        description: oldSystem.description,
        status: oldSystem.status,
      },
      afterChange: {
        name: system.name,
        code: system.code,
        description: system.description,
        status: system.status,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      data: system,
    });
  } catch (error) {
    console.error('更新系统失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '更新系统失败',
    });
  }
};

/**
 * 删除系统
 */
const deleteSystem = async (req, res) => {
  try {
    const system = await System.findByIdAndDelete(req.params.id);
    
    if (!system) {
      return res.status(404).json({
        code: 404,
        message: '系统不存在',
      });
    }
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'delete',
      targetType: 'system',
      targetId: system._id,
      targetName: system.name,
      systemId: system._id,
      beforeChange: {
        name: system.name,
        code: system.code,
      },
      afterChange: null,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除系统失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '删除系统失败',
    });
  }
};

module.exports = {
  getSystems,
  getSystemById,
  createSystem,
  updateSystem,
  deleteSystem,
};
