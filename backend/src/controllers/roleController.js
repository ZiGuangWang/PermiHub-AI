const Role = require('../models/Role');
const Permission = require('../models/Permission');
const logOperation = require('../utils/logger');

/**
 * 获取角色列表
 */
const getRoles = async (req, res) => {
  try {
    const { systemId, status, keyword, page = 1, pageSize = 20 } = req.query;
    
    const query = {};
    
    if (systemId) {
      query.systemId = systemId;
    }
    
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
    
    const [roles, total] = await Promise.all([
      Role.find(query)
        .populate('systemId', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Role.countDocuments(query),
    ]);
    
    res.json({
      code: 200,
      data: {
        list: roles,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取角色列表失败',
    });
  }
};

/**
 * 获取角色详情（含权限）
 */
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('systemId', 'name code')
      .populate('permissions', 'name code type parentId');
    
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在',
      });
    }
    
    res.json({
      code: 200,
      data: role,
    });
  } catch (error) {
    console.error('获取角色详情失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取角色详情失败',
    });
  }
};

/**
 * 创建角色
 */
const createRole = async (req, res) => {
  try {
    const { systemId, name, code, description, permissions, status } = req.body;
    
    // 检查编码是否已存在
    const existing = await Role.findOne({ systemId, code });
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: '角色编码已存在',
      });
    }
    
    const role = await Role.create({
      systemId,
      name,
      code,
      description,
      permissions: permissions || [],
      status: status !== undefined ? status : 1,
    });
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'create',
      targetType: 'role',
      targetId: role._id.toString(),
      targetName: role.name,
      systemId,
      afterChange: {
        name: role.name,
        code: role.code,
        permissionCount: role.permissions.length,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.status(201).json({
      code: 200,
      data: role,
    });
  } catch (error) {
    console.error('创建角色失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '创建角色失败',
    });
  }
};

/**
 * 更新角色
 */
const updateRole = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;
    
    const oldRole = await Role.findById(req.params.id);
    
    if (!oldRole) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在',
      });
    }
    
    // 如果修改了编码，检查新编码是否已被使用
    if (code && code !== oldRole.code) {
      const existing = await Role.findOne({ 
        systemId: oldRole.systemId, 
        code,
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({
          code: 400,
          message: '角色编码已存在',
        });
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'update',
      targetType: 'role',
      targetId: role._id.toString(),
      targetName: role.name,
      systemId: role.systemId.toString(),
      beforeChange: {
        name: oldRole.name,
        code: oldRole.code,
        description: oldRole.description,
        status: oldRole.status,
      },
      afterChange: {
        name: role.name,
        code: role.code,
        description: role.description,
        status: role.status,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      data: role,
    });
  } catch (error) {
    console.error('更新角色失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '更新角色失败',
    });
  }
};

/**
 * 分配角色权限
 */
const assignPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    const oldRole = await Role.findById(req.params.id);
    
    if (!oldRole) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在',
      });
    }
    
    // 验证权限是否存在
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({ 
        _id: { $in: permissions },
        systemId: oldRole.systemId 
      });
      
      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({
          code: 400,
          message: '存在无效的权限 ID',
        });
      }
    }
    
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true }
    ).populate('permissions', 'name code type');
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'assign_permission',
      targetType: 'role',
      targetId: role._id.toString(),
      targetName: role.name,
      systemId: role.systemId.toString(),
      beforeChange: {
        permissionIds: oldRole.permissions.map(p => p.toString()),
        permissionCount: oldRole.permissions.length,
      },
      afterChange: {
        permissionIds: role.permissions.map(p => p._id.toString()),
        permissionCount: role.permissions.length,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      data: role,
    });
  } catch (error) {
    console.error('分配角色权限失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '分配角色权限失败',
    });
  }
};

/**
 * 删除角色
 */
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在',
      });
    }
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'delete',
      targetType: 'role',
      targetId: role._id.toString(),
      targetName: role.name,
      systemId: role.systemId.toString(),
      beforeChange: {
        name: role.name,
        code: role.code,
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
    console.error('删除角色失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '删除角色失败',
    });
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  assignPermissions,
  deleteRole,
};
