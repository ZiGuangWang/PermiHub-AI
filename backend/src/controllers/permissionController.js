const Permission = require('../models/Permission');
const logOperation = require('../utils/logger');

/**
 * 获取权限列表
 */
const getPermissions = async (req, res) => {
  try {
    const { systemId, status, keyword, page = 1, pageSize = 100 } = req.query;
    
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
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const [permissions, total] = await Promise.all([
      Permission.find(query)
        .populate('systemId', 'name code')
        .sort({ sort: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Permission.countDocuments(query),
    ]);
    
    res.json({
      code: 200,
      data: {
        list: permissions,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error('获取权限列表失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取权限列表失败',
    });
  }
};

/**
 * 获取权限树形结构
 */
const getPermissionTree = async (req, res) => {
  try {
    const { systemId } = req.query;
    
    if (!systemId) {
      return res.status(400).json({
        code: 400,
        message: '系统 ID 不能为空',
      });
    }
    
    const permissions = await Permission.find({ systemId, status: 1 })
      .sort({ sort: 1, createdAt: -1 });
    
    // 构建树形结构
    const tree = buildPermissionTree(permissions, null);
    
    res.json({
      code: 200,
      data: tree,
    });
  } catch (error) {
    console.error('获取权限树失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取权限树失败',
    });
  }
};

/**
 * 构建树形结构的辅助函数
 */
const buildPermissionTree = (permissions, parentId) => {
  return permissions
    .filter(p => {
      const pParentId = p.parentId ? p.parentId.toString() : null;
      const targetParentId = parentId ? parentId.toString() : null;
      return pParentId === targetParentId;
    })
    .map(p => ({
      ...p.toObject(),
      children: buildPermissionTree(permissions, p._id),
    }));
};

/**
 * 获取权限详情
 */
const getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id)
      .populate('systemId', 'name code');
    
    if (!permission) {
      return res.status(404).json({
        code: 404,
        message: '权限不存在',
      });
    }
    
    res.json({
      code: 200,
      data: permission,
    });
  } catch (error) {
    console.error('获取权限详情失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取权限详情失败',
    });
  }
};

/**
 * 创建权限
 */
const createPermission = async (req, res) => {
  try {
    const { systemId, name, code, type, parentId, sort, status } = req.body;
    
    // 检查编码是否已存在
    const existing = await Permission.findOne({ systemId, code });
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: '权限编码已存在',
      });
    }
    
    const permission = await Permission.create({
      systemId,
      name,
      code,
      type: type || 'menu',
      parentId: parentId || null,
      sort: sort || 0,
      status: status !== undefined ? status : 1,
    });
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'create',
      targetType: 'permission',
      targetId: permission._id.toString(),
      targetName: permission.name,
      systemId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.status(201).json({
      code: 200,
      data: permission,
    });
  } catch (error) {
    console.error('创建权限失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '创建权限失败',
    });
  }
};

/**
 * 更新权限
 */
const updatePermission = async (req, res) => {
  try {
    const { name, code, type, parentId, sort, status } = req.body;
    
    const oldPermission = await Permission.findById(req.params.id);
    
    if (!oldPermission) {
      return res.status(404).json({
        code: 404,
        message: '权限不存在',
      });
    }
    
    // 如果修改了编码，检查新编码是否已被使用
    if (code && code !== oldPermission.code) {
      const existing = await Permission.findOne({ 
        systemId: oldPermission.systemId, 
        code,
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({
          code: 400,
          message: '权限编码已存在',
        });
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (type !== undefined) updateData.type = type;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (sort !== undefined) updateData.sort = sort;
    if (status !== undefined) updateData.status = status;
    
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'update',
      targetType: 'permission',
      targetId: permission._id.toString(),
      targetName: permission.name,
      systemId: permission.systemId.toString(),
      beforeChange: {
        name: oldPermission.name,
        code: oldPermission.code,
        type: oldPermission.type,
        sort: oldPermission.sort,
        status: oldPermission.status,
      },
      afterChange: {
        name: permission.name,
        code: permission.code,
        type: permission.type,
        sort: permission.sort,
        status: permission.status,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      data: permission,
    });
  } catch (error) {
    console.error('更新权限失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '更新权限失败',
    });
  }
};

/**
 * 删除权限
 */
const deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);
    
    if (!permission) {
      return res.status(404).json({
        code: 404,
        message: '权限不存在',
      });
    }
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'delete',
      targetType: 'permission',
      targetId: permission._id.toString(),
      targetName: permission.name,
      systemId: permission.systemId.toString(),
      beforeChange: {
        name: permission.name,
        code: permission.code,
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
    console.error('删除权限失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '删除权限失败',
    });
  }
};

module.exports = {
  getPermissions,
  getPermissionTree,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
};
