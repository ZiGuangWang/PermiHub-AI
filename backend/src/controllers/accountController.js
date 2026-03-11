const Account = require('../models/Account');
const AccountSystem = require('../models/AccountSystem');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const logOperation = require('../utils/logger');

/**
 * 获取账号列表
 */
const getAccounts = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    
    const query = {};
    
    if (status !== undefined) {
      query.status = parseInt(status);
    }
    
    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    const [accounts, total] = await Promise.all([
      Account.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Account.countDocuments(query),
    ]);
    
    res.json({
      code: 200,
      data: {
        list: accounts,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error('获取账号列表失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取账号列表失败',
    });
  }
};

/**
 * 获取账号详情
 */
const getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).select('-password');
    
    if (!account) {
      return res.status(404).json({
        code: 404,
        message: '账号不存在',
      });
    }
    
    res.json({
      code: 200,
      data: account,
    });
  } catch (error) {
    console.error('获取账号详情失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取账号详情失败',
    });
  }
};

/**
 * 创建账号
 */
const createAccount = async (req, res) => {
  try {
    const { username, password, email, phone, status } = req.body;
    
    // 检查用户名是否已存在
    const existing = await Account.findOne({ username });
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在',
      });
    }
    
    const account = await Account.create({
      username,
      password,
      email,
      phone,
      status: status !== undefined ? status : 1,
    });
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'create',
      targetType: 'account',
      targetId: account._id.toString(),
      targetName: account.username,
      afterChange: {
        username: account.username,
        email: account.email,
        phone: account.phone,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.status(201).json({
      code: 200,
      data: {
        _id: account._id,
        username: account.username,
        email: account.email,
        phone: account.phone,
        status: account.status,
      },
    });
  } catch (error) {
    console.error('创建账号失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '创建账号失败',
    });
  }
};

/**
 * 更新账号
 */
const updateAccount = async (req, res) => {
  try {
    const { email, phone, status } = req.body;
    
    const oldAccount = await Account.findById(req.params.id);
    
    if (!oldAccount) {
      return res.status(404).json({
        code: 404,
        message: '账号不存在',
      });
    }
    
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;
    
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'update',
      targetType: 'account',
      targetId: account._id.toString(),
      targetName: account.username,
      beforeChange: {
        email: oldAccount.email,
        phone: oldAccount.phone,
        status: oldAccount.status,
      },
      afterChange: {
        email: account.email,
        phone: account.phone,
        status: account.status,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      data: account,
    });
  } catch (error) {
    console.error('更新账号失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '更新账号失败',
    });
  }
};

/**
 * 重置密码
 */
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    const account = await Account.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        code: 404,
        message: '账号不存在',
      });
    }
    
    account.password = newPassword;
    await account.save();
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'update',
      targetType: 'account',
      targetId: account._id.toString(),
      targetName: account.username,
      beforeChange: { action: 'reset_password' },
      afterChange: { action: 'password_reset' },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      message: '密码重置成功',
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '重置密码失败',
    });
  }
};

/**
 * 删除账号
 */
const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        code: 404,
        message: '账号不存在',
      });
    }
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'delete',
      targetType: 'account',
      targetId: account._id.toString(),
      targetName: account.username,
      beforeChange: {
        username: account.username,
        email: account.email,
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
    console.error('删除账号失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '删除账号失败',
    });
  }
};

/**
 * 为账号分配角色
 */
const assignRole = async (req, res) => {
  try {
    const { systemId, roleId } = req.body;
    
    if (!systemId || !roleId) {
      return res.status(400).json({
        code: 400,
        message: '系统 ID 和角色 ID 不能为空',
      });
    }
    
    // 验证角色是否存在
    const role = await Role.findOne({ _id: roleId, systemId });
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在或不属于指定系统',
      });
    }
    
    // 查找或创建账号 - 系统关联
    let accountSystem = await AccountSystem.findOne({ 
      accountId: req.params.id, 
      systemId 
    });
    
    const oldRoleId = accountSystem ? accountSystem.roleId : null;
    
    if (accountSystem) {
      accountSystem.roleId = roleId;
      await accountSystem.save();
    } else {
      accountSystem = await AccountSystem.create({
        accountId: req.params.id,
        systemId,
        roleId,
      });
    }
    
    // 获取账号信息
    const account = await Account.findById(req.params.id);
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'assign_permission',
      targetType: 'account',
      targetId: req.params.id,
      targetName: account.username,
      systemId,
      beforeChange: {
        roleId: oldRoleId ? oldRoleId.toString() : null,
        action: 'change_role',
      },
      afterChange: {
        roleId: roleId.toString(),
        roleName: role.name,
        action: 'role_assigned',
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      message: '角色分配成功',
    });
  } catch (error) {
    console.error('分配角色失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '分配角色失败',
    });
  }
};

/**
 * 调整账号个性化权限
 */
const adjustPermissions = async (req, res) => {
  try {
    const { systemId, extraPermissions = [], deniedPermissions = [] } = req.body;
    
    if (!systemId) {
      return res.status(400).json({
        code: 400,
        message: '系统 ID 不能为空',
      });
    }
    
    // 验证权限是否存在
    if (extraPermissions.length > 0 || deniedPermissions.length > 0) {
      const allPermIds = [...extraPermissions, ...deniedPermissions];
      const validPermissions = await Permission.find({ 
        _id: { $in: allPermIds },
        systemId 
      });
      
      if (validPermissions.length !== allPermIds.length) {
        return res.status(400).json({
          code: 400,
          message: '存在无效的权限 ID',
        });
      }
    }
    
    // 查找或创建账号 - 系统关联
    let accountSystem = await AccountSystem.findOne({ 
      accountId: req.params.id, 
      systemId 
    });
    
    const oldExtraPerms = accountSystem ? [...accountSystem.extraPermissions] : [];
    const oldDeniedPerms = accountSystem ? [...accountSystem.deniedPermissions] : [];
    
    if (accountSystem) {
      accountSystem.extraPermissions = extraPermissions;
      accountSystem.deniedPermissions = deniedPermissions;
      await accountSystem.save();
    } else {
      accountSystem = await AccountSystem.create({
        accountId: req.params.id,
        systemId,
        extraPermissions,
        deniedPermissions,
      });
    }
    
    // 获取账号信息
    const account = await Account.findById(req.params.id);
    
    // 记录日志
    await logOperation({
      operatorId: req.userId,
      operatorName: req.user.username,
      action: 'assign_permission',
      targetType: 'account',
      targetId: req.params.id,
      targetName: account.username,
      systemId,
      beforeChange: {
        extraPermissionIds: oldExtraPerms.map(p => p.toString()),
        deniedPermissionIds: oldDeniedPerms.map(p => p.toString()),
      },
      afterChange: {
        extraPermissionIds: extraPermissions.map(p => p.toString()),
        deniedPermissionIds: deniedPermissions.map(p => p.toString()),
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      code: 200,
      message: '权限调整成功',
    });
  } catch (error) {
    console.error('调整权限失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '调整权限失败',
    });
  }
};

/**
 * 获取账号在某系统的权限
 */
const getAccountSystemPermissions = async (req, res) => {
  try {
    const { accountId, systemId } = req.params;
    
    // 查找账号 - 系统关联
    const accountSystem = await AccountSystem.findOne({ 
      accountId, 
      systemId 
    })
    .populate('roleId', 'name code permissions')
    .populate('extraPermissions', 'name code type')
    .populate('deniedPermissions', 'name code type');
    
    if (!accountSystem) {
      return res.json({
        code: 200,
        data: {
          roleId: null,
          roleName: null,
          rolePermissions: [],
          extraPermissions: [],
          deniedPermissions: [],
          finalPermissions: [],
        },
      });
    }
    
    // 计算最终权限
    let rolePermissionIds = [];
    if (accountSystem.roleId && accountSystem.roleId.permissions) {
      rolePermissionIds = accountSystem.roleId.permissions.map(p => p._id.toString());
    }
    
    const extraPermissionIds = accountSystem.extraPermissions.map(p => p._id.toString());
    const deniedPermissionIds = accountSystem.deniedPermissions.map(p => p._id.toString());
    
    // 最终权限 = (角色权限 ∪ 额外权限) - 拒绝权限
    const allPermissionIds = new Set([...rolePermissionIds, ...extraPermissionIds]);
    const finalPermissionIds = [...allPermissionIds].filter(id => !deniedPermissionIds.includes(id));
    
    res.json({
      code: 200,
      data: {
        roleId: accountSystem.roleId ? accountSystem.roleId._id : null,
        roleName: accountSystem.roleId ? accountSystem.roleId.name : null,
        rolePermissions: rolePermissionIds,
        extraPermissions: extraPermissionIds,
        deniedPermissions: deniedPermissionIds,
        finalPermissions: finalPermissionIds,
      },
    });
  } catch (error) {
    console.error('获取账号权限失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取账号权限失败',
    });
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  resetPassword,
  deleteAccount,
  assignRole,
  adjustPermissions,
  getAccountSystemPermissions,
};
