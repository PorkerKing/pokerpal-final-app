// AI 数据库写入操作工具 - SaaS系统的核心创新
// 通过自然语言AI来执行数据库修改操作

import { CoreTool } from 'ai';

// 调整用户余额工具（前台/管理员权限）
export const adjustUserBalanceTool: CoreTool = {
  description: '调整指定用户的余额，支持增加或减少金额，需要前台或管理员权限',
  parameters: {
    type: 'object',
    properties: {
      userId: { 
        type: 'string', 
        description: '目标用户ID' 
      },
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      },
      amount: { 
        type: 'number', 
        description: '调整金额（正数为增加，负数为减少）' 
      },
      reason: { 
        type: 'string', 
        description: '调整原因说明' 
      },
      operatorId: { 
        type: 'string', 
        description: '操作员用户ID' 
      }
    },
    required: ['userId', 'clubId', 'amount', 'reason', 'operatorId']
  },
  execute: async ({ userId, clubId, amount, reason, operatorId }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}/members/${userId}/adjust-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Operator-ID': operatorId
        },
        body: JSON.stringify({
          amount,
          reason,
          type: amount > 0 ? 'DEPOSIT' : 'WITHDRAWAL'
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return `余额调整失败: ${result.error}`;
      }
      
      return `✅ 余额调整成功！
      
用户余额已${amount > 0 ? '增加' : '减少'} $${Math.abs(amount)}
当前余额: $${result.data.newBalance}
操作原因: ${reason}
操作时间: ${new Date().toLocaleString('zh-CN')}`;
      
    } catch (error) {
      return `调整余额时出错: ${error}`;
    }
  }
};

// 积分兑换工具（会员权限）
export const redeemPointsTool: CoreTool = {
  description: '使用积分兑换俱乐部商店的物品或服务',
  parameters: {
    type: 'object',
    properties: {
      userId: { 
        type: 'string', 
        description: '用户ID' 
      },
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      },
      itemId: { 
        type: 'string', 
        description: '兑换物品ID' 
      },
      quantity: { 
        type: 'number', 
        description: '兑换数量，默认为1',
        default: 1
      }
    },
    required: ['userId', 'clubId', 'itemId']
  },
  execute: async ({ userId, clubId, itemId, quantity = 1 }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}/store/${itemId}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({ quantity })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return `积分兑换失败: ${result.error}`;
      }
      
      return `🎁 积分兑换成功！
      
已兑换: ${result.data.itemName} × ${quantity}
消耗积分: ${result.data.pointsUsed}
剩余积分: ${result.data.remainingPoints}
请联系俱乐部工作人员领取您的物品！`;
      
    } catch (error) {
      return `积分兑换时出错: ${error}`;
    }
  }
};

// 管理牌桌状态工具（荷官/管理员权限）
export const manageTableTool: CoreTool = {
  description: '管理牌桌状态，可以开始、暂停、恢复或关闭游戏',
  parameters: {
    type: 'object',
    properties: {
      tableId: { 
        type: 'string', 
        description: '牌桌ID' 
      },
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      },
      action: { 
        type: 'string', 
        enum: ['start', 'pause', 'resume', 'close'],
        description: '操作类型：开始/暂停/恢复/关闭' 
      },
      operatorId: { 
        type: 'string', 
        description: '操作员ID（荷官或管理员）' 
      },
      reason: { 
        type: 'string', 
        description: '操作原因说明',
        default: '正常操作'
      }
    },
    required: ['tableId', 'clubId', 'action', 'operatorId']
  },
  execute: async ({ tableId, clubId, action, operatorId, reason = '正常操作' }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}/tables/${tableId}/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Operator-ID': operatorId
        },
        body: JSON.stringify({
          action,
          reason
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return `牌桌操作失败: ${result.error}`;
      }
      
      const actionText: Record<string, string> = {
        'start': '开始',
        'pause': '暂停',
        'resume': '恢复',
        'close': '关闭'
      };
      const actionDisplayText = actionText[action] || action;
      
      return `🎰 牌桌操作成功！
      
操作: ${actionDisplayText}游戏
牌桌: ${result.data.tableName}
当前状态: ${result.data.newStatus}
操作原因: ${reason}
操作时间: ${new Date().toLocaleString('zh-CN')}`;
      
    } catch (error) {
      return `牌桌操作时出错: ${error}`;
    }
  }
};

// 修改会员信息工具（管理员权限）
export const modifyMemberTool: CoreTool = {
  description: '修改会员的基本信息、角色或状态',
  parameters: {
    type: 'object',
    properties: {
      memberId: { 
        type: 'string', 
        description: '会员ID' 
      },
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      },
      operatorId: { 
        type: 'string', 
        description: '操作员ID' 
      },
      changes: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'RECEPTIONIST'],
            description: '新角色'
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
            description: '新状态'
          },
          vipLevel: {
            type: 'number',
            description: '新VIP等级'
          }
        },
        description: '要修改的字段'
      },
      reason: { 
        type: 'string', 
        description: '修改原因' 
      }
    },
    required: ['memberId', 'clubId', 'operatorId', 'changes', 'reason']
  },
  execute: async ({ memberId, clubId, operatorId, changes, reason }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Operator-ID': operatorId
        },
        body: JSON.stringify({
          ...changes,
          reason
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return `修改会员信息失败: ${result.error}`;
      }
      
      let changesList = [];
      if (changes.role) changesList.push(`角色: ${changes.role}`);
      if (changes.status) changesList.push(`状态: ${changes.status}`);
      if (changes.vipLevel) changesList.push(`VIP等级: ${changes.vipLevel}`);
      
      return `👤 会员信息修改成功！
      
会员: ${result.data.memberName}
修改内容: ${changesList.join(', ')}
修改原因: ${reason}
操作时间: ${new Date().toLocaleString('zh-CN')}`;
      
    } catch (error) {
      return `修改会员信息时出错: ${error}`;
    }
  }
};

// 处理充值申请工具（前台权限）
export const processDepositTool: CoreTool = {
  description: '处理用户的充值申请，确认充值金额并更新余额',
  parameters: {
    type: 'object',
    properties: {
      userId: { 
        type: 'string', 
        description: '用户ID' 
      },
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      },
      amount: { 
        type: 'number', 
        description: '充值金额' 
      },
      paymentMethod: { 
        type: 'string', 
        description: '支付方式（如：银行转账、支付宝、微信等）' 
      },
      operatorId: { 
        type: 'string', 
        description: '前台员ID' 
      },
      notes: { 
        type: 'string', 
        description: '备注信息',
        default: ''
      }
    },
    required: ['userId', 'clubId', 'amount', 'paymentMethod', 'operatorId']
  },
  execute: async ({ userId, clubId, amount, paymentMethod, operatorId, notes = '' }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}/transactions/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Operator-ID': operatorId
        },
        body: JSON.stringify({
          userId,
          amount,
          paymentMethod,
          notes,
          type: 'DEPOSIT'
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return `处理充值失败: ${result.error}`;
      }
      
      return `💰 充值处理成功！
      
用户: ${result.data.userName}
充值金额: $${amount}
支付方式: ${paymentMethod}
账户余额: $${result.data.newBalance}
交易号: ${result.data.transactionId}
处理时间: ${new Date().toLocaleString('zh-CN')}
${notes ? `备注: ${notes}` : ''}`;
      
    } catch (error) {
      return `处理充值时出错: ${error}`;
    }
  }
};

// 导出所有数据库操作工具
export const databaseOperationTools = {
  adjustUserBalance: adjustUserBalanceTool,
  redeemPoints: redeemPointsTool,
  manageTable: manageTableTool,
  modifyMember: modifyMemberTool,
  processDeposit: processDepositTool
};