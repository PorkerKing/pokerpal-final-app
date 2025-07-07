// AI权限和操作分类系统

export interface UserRole {
  role: string;
  clubId: string;
  userId: string;
}

export interface OperationConfig {
  type: 'query' | 'modify';
  requiresConfirmation: boolean;
  requiredRoles: string[];
  description: string;
  confirmationMessage: string;
}

// 操作分类配置
export const AI_OPERATIONS: Record<string, OperationConfig> = {
  // === 查询操作 - 个人信息 (无需确认) ===
  'view_my_balance': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'CASHIER'],
    description: '查看自己的余额',
    confirmationMessage: ''
  },
  'view_my_points': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'CASHIER'],
    description: '查看自己的积分',
    confirmationMessage: ''
  },
  'view_my_statistics': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'CASHIER'],
    description: '查看个人战绩',
    confirmationMessage: ''
  },
  'view_my_transactions': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'CASHIER'],
    description: '查看个人交易记录',
    confirmationMessage: ''
  },

  // === 查询操作 - 公开信息 (无需确认) ===
  'view_tournaments': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'CASHIER'],
    description: '查看锦标赛列表',
    confirmationMessage: ''
  },
  'view_tables': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'CASHIER'],
    description: '查看牌桌状态',
    confirmationMessage: ''
  },
  'view_club_info': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'CASHIER'],
    description: '查看俱乐部基本信息',
    confirmationMessage: ''
  },

  // === 查询操作 - 内部信息 (仅管理层) ===
  'view_members': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '查看会员列表',
    confirmationMessage: ''
  },
  'view_finances': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '查看财务状况',
    confirmationMessage: ''
  },
  'view_all_transactions': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '查看所有交易记录',
    confirmationMessage: ''
  },
  'view_user_balance': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '查看其他用户余额',
    confirmationMessage: ''
  },

  // === 修改操作 - 会员权限 (需要确认) ===
  'register_tournament': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'],
    description: '报名参加锦标赛',
    confirmationMessage: '您确定要报名参加这个锦标赛吗？这将从您的余额中扣除报名费。'
  },
  'redeem_points': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'],
    description: '积分兑换礼品',
    confirmationMessage: '您确定要用积分兑换这个物品吗？兑换后积分将被扣除且无法撤销。'
  },
  'join_table': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'],
    description: '加入牌桌',
    confirmationMessage: '您确定要加入这个牌桌吗？这将从您的余额中扣除买入金额。'
  },

  // === 修改操作 - 荷官权限 (需要确认，管理者继承) ===
  'manage_table': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'DEALER'],
    description: '管理牌桌状态',
    confirmationMessage: '您确定要对这个牌桌进行操作吗？这可能会影响正在游戏的玩家。'
  },
  'start_game': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'DEALER'],
    description: '开始游戏',
    confirmationMessage: '您确定要开始这场游戏吗？'
  },
  'pause_game': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'DEALER'],
    description: '暂停游戏',
    confirmationMessage: '您确定要暂停这场游戏吗？这会影响所有参与的玩家。'
  },

  // === 修改操作 - 出纳权限 (需要确认，管理者继承) ===
  'adjust_balance': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'CASHIER'],
    description: '调整用户余额',
    confirmationMessage: '您确定要调整这位用户的余额吗？这个操作将被记录并无法轻易撤销。'
  },
  'process_withdrawal': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'CASHIER'],
    description: '处理提现申请',
    confirmationMessage: '您确定要处理这笔提现申请吗？请确保已完成相关审核流程。'
  },
  'process_deposit': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'CASHIER'],
    description: '处理充值申请',
    confirmationMessage: '您确定要处理这笔充值申请吗？请确认金额和付款信息。'
  },

  // === 修改操作 - 管理员权限 (需要确认) ===
  'create_tournament': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '创建锦标赛',
    confirmationMessage: '您确定要创建这个锦标赛吗？创建后其他会员将能看到并报名参加。'
  },
  'open_table': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '开设新牌桌',
    confirmationMessage: '您确定要开设这个新牌桌吗？这将消耗俱乐部资源并需要荷官管理。'
  },
  'modify_member': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '修改会员信息',
    confirmationMessage: '您确定要修改这位会员的信息吗？这个操作将被记录在系统中。'
  },
  'invite_member': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '邀请新会员',
    confirmationMessage: '您确定要邀请这位新会员加入俱乐部吗？'
  },

  // === 修改操作 - 最高权限 (仅OWNER和ADMIN) ===
  'modify_settings': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN'],
    description: '修改俱乐部设置',
    confirmationMessage: '您确定要修改俱乐部设置吗？这将影响整个俱乐部的运营。'
  },
  'delete_member': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN'],
    description: '删除会员',
    confirmationMessage: '您确定要删除这位会员吗？此操作不可撤销，会员的所有数据将被永久删除。'
  },
  'change_member_role': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN'],
    description: '修改会员角色',
    confirmationMessage: '您确定要修改这位会员的角色吗？这将改变他们的系统权限。'
  }
};

// 检查用户是否有权限执行某个操作
export function hasPermission(userRole: UserRole, operation: string): boolean {
  const config = AI_OPERATIONS[operation];
  if (!config) return false;
  
  return config.requiredRoles.includes(userRole.role);
}

// 检查操作是否需要确认
export function requiresConfirmation(operation: string): boolean {
  const config = AI_OPERATIONS[operation];
  return config?.requiresConfirmation || false;
}

// 获取确认消息
export function getConfirmationMessage(operation: string): string {
  const config = AI_OPERATIONS[operation];
  return config?.confirmationMessage || '您确定要执行这个操作吗？';
}

// 根据用户输入识别操作类型
export function identifyOperation(userInput: string): string | null {
  const input = userInput.toLowerCase();
  
  // === 个人信息查询操作 ===
  if ((input.includes('我的') || input.includes('my')) && (input.includes('余额') || input.includes('balance'))) return 'view_my_balance';
  if ((input.includes('我的') || input.includes('my')) && (input.includes('积分') || input.includes('points'))) return 'view_my_points';
  if ((input.includes('我的') || input.includes('my')) && (input.includes('战绩') || input.includes('统计') || input.includes('stats'))) return 'view_my_statistics';
  if ((input.includes('我的') || input.includes('my')) && (input.includes('交易') || input.includes('记录') || input.includes('transactions'))) return 'view_my_transactions';
  
  // === 公开信息查询操作 ===
  if (input.includes('锦标赛') && (input.includes('查看') || input.includes('列表') || input.includes('list'))) return 'view_tournaments';
  if (input.includes('牌桌') && (input.includes('查看') || input.includes('状态') || input.includes('list'))) return 'view_tables';
  if (input.includes('俱乐部') && (input.includes('信息') || input.includes('介绍') || input.includes('info'))) return 'view_club_info';
  
  // === 内部信息查询操作（需要管理权限）===
  if (input.includes('会员') && (input.includes('列表') || input.includes('list'))) return 'view_members';
  if ((input.includes('财务') || input.includes('finance')) && (input.includes('查看') || input.includes('状况'))) return 'view_finances';
  if (input.includes('所有') && (input.includes('交易') || input.includes('transactions'))) return 'view_all_transactions';
  if ((input.includes('用户') || input.includes('其他') || input.includes('他人')) && (input.includes('余额') || input.includes('balance'))) return 'view_user_balance';
  
  // === 会员修改操作 ===
  if (input.includes('报名') || input.includes('参加') || input.includes('register')) return 'register_tournament';
  if (input.includes('兑换') && input.includes('积分')) return 'redeem_points';
  if (input.includes('加入') && input.includes('牌桌')) return 'join_table';
  
  // === 荷官修改操作 ===
  if (input.includes('管理') && input.includes('牌桌')) return 'manage_table';
  if (input.includes('开始') && input.includes('游戏')) return 'start_game';
  if (input.includes('暂停') && input.includes('游戏')) return 'pause_game';
  
  // === 出纳修改操作 ===
  if (input.includes('调整') && input.includes('余额')) return 'adjust_balance';
  if (input.includes('提现') || input.includes('withdrawal')) return 'process_withdrawal';
  if (input.includes('充值') || input.includes('deposit')) return 'process_deposit';
  
  // === 管理员修改操作 ===
  if (input.includes('创建') && input.includes('锦标赛')) return 'create_tournament';
  if (input.includes('开设') && input.includes('牌桌')) return 'open_table';
  if (input.includes('修改') && input.includes('会员')) return 'modify_member';
  if (input.includes('邀请') && input.includes('会员')) return 'invite_member';
  
  // === 最高权限修改操作 ===
  if (input.includes('修改') && (input.includes('设置') || input.includes('配置'))) return 'modify_settings';
  if (input.includes('删除') && input.includes('会员')) return 'delete_member';
  if (input.includes('修改') && input.includes('角色')) return 'change_member_role';
  
  // 默认情况：如果只是询问余额、积分等，默认为查询自己的信息
  if (input.includes('余额') || input.includes('balance')) return 'view_my_balance';
  if (input.includes('积分') || input.includes('points')) return 'view_my_points';
  if (input.includes('战绩') || input.includes('统计') || input.includes('stats')) return 'view_my_statistics';
  
  return null;
}

// 角色权限说明
export const ROLE_DESCRIPTIONS = {
  'OWNER': '俱乐部所有者 - 拥有所有权限，包含所有其他角色功能',
  'ADMIN': '管理员 - 拥有最高管理权限，包含出纳和荷官的所有权限',
  'MANAGER': '经理 - 拥有高级管理权限，包含出纳和荷官的所有权限',
  'MEMBER': '会员 - 只能查看个人信息和俱乐部公开信息，可参与游戏',
  'DEALER': '荷官 - 负责牌桌管理，可开始/暂停游戏，无财务权限',
  'CASHIER': '出纳 - 负责财务操作，可调整余额和处理充提，无牌桌管理权限'
};

// 权限层级 (数字越高权限越大)
export const ROLE_HIERARCHY = {
  'MEMBER': 1,
  'DEALER': 2,
  'CASHIER': 2,
  'MANAGER': 4,
  'ADMIN': 5,
  'OWNER': 6
};

// 检查角色是否可以管理另一个角色
export function canManageRole(managerRole: string, targetRole: string): boolean {
  return (ROLE_HIERARCHY[managerRole as keyof typeof ROLE_HIERARCHY] || 0) > 
         (ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY] || 0);
}