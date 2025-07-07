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

// 操作分类配置 - 根据用户角色细化权限
export const AI_OPERATIONS: Record<string, OperationConfig> = {
  // === 会员权限: 查询和操作自己的账号信息和公开信息 ===
  'view_my_balance': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'RECEPTIONIST'],
    description: '查看自己的余额',
    confirmationMessage: ''
  },
  'view_my_points': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'RECEPTIONIST'],
    description: '查看自己的积分',
    confirmationMessage: ''
  },
  'view_my_statistics': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'RECEPTIONIST'],
    description: '查看个人战绩',
    confirmationMessage: ''
  },
  'view_my_transactions': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'RECEPTIONIST'],
    description: '查看个人交易记录',
    confirmationMessage: ''
  },
  'consultation': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'RECEPTIONIST'],
    description: '咨询服务',
    confirmationMessage: ''
  },
  'register_tournament': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'RECEPTIONIST'],
    description: '比赛报名',
    confirmationMessage: '您确定要报名参加这个比赛吗？'
  },
  'change_table': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'],
    description: '换桌',
    confirmationMessage: '您确定要申请换桌吗？'
  },
  'rebuy': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'],
    description: 'Rebuy补充筹码',
    confirmationMessage: '您确定要进行Rebuy吗？'
  },

  // === 查询操作 - 公开信息 (无需确认) ===
  'view_tournaments': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'RECEPTIONIST'],
    description: '查看锦标赛列表',
    confirmationMessage: ''
  },
  'view_tables': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'RECEPTIONIST'],
    description: '查看牌桌状态',
    confirmationMessage: ''
  },
  'view_club_info': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'RECEPTIONIST'],
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

  // === 前台权限: 比赛报名，会员查询，退赛，放奖，财务报表 ===
  'member_query': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'RECEPTIONIST'],
    description: '会员查询',
    confirmationMessage: ''
  },
  'tournament_unregister': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'RECEPTIONIST'],
    description: '退赛',
    confirmationMessage: '您确定要为这位会员办理退赛吗？'
  },
  'distribute_prize': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'RECEPTIONIST'],
    description: '放奖',
    confirmationMessage: '您确定要发放这个奖金吗？请确认金额和获奖者信息。'
  },
  'view_financial_report': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'RECEPTIONIST'],
    description: '财务报表',
    confirmationMessage: ''
  },

  // === DL权限: 核对，确认 ===
  'verify_operation': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'DEALER'],
    description: '核对操作',
    confirmationMessage: ''
  },
  'confirm_operation': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER', 'DEALER'],
    description: '确认操作',
    confirmationMessage: '您确定要确认这个操作吗？'
  },

  // === 管理权限: 创建比赛，暂停比赛，比赛调整，桌位调整，数据分析 ===
  'create_tournament': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '创建比赛',
    confirmationMessage: '您确定要创建这个比赛吗？创建后会员将能看到并报名参加。'
  },
  'pause_tournament': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '暂停比赛',
    confirmationMessage: '您确定要暂停这个比赛吗？这会影响所有参与的玩家。'
  },
  'adjust_tournament': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '比赛调整',
    confirmationMessage: '您确定要调整这个比赛的设置吗？'
  },
  'adjust_table': {
    type: 'modify',
    requiresConfirmation: true,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '桌位调整',
    confirmationMessage: '您确定要调整桌位安排吗？这可能会影响正在游戏的玩家。'
  },
  'data_analysis': {
    type: 'query',
    requiresConfirmation: false,
    requiredRoles: ['OWNER', 'ADMIN', 'MANAGER'],
    description: '数据分析',
    confirmationMessage: ''
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
  'RECEPTIONIST': '出纳 - 负责财务操作，可调整余额和处理充提，无牌桌管理权限'
};

// 权限层级 (数字越高权限越大)
export const ROLE_HIERARCHY = {
  'MEMBER': 1,
  'DEALER': 2,
  'RECEPTIONIST': 2,
  'MANAGER': 4,
  'ADMIN': 5,
  'OWNER': 6
};

// 检查角色是否可以管理另一个角色
export function canManageRole(managerRole: string, targetRole: string): boolean {
  return (ROLE_HIERARCHY[managerRole as keyof typeof ROLE_HIERARCHY] || 0) > 
         (ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY] || 0);
}