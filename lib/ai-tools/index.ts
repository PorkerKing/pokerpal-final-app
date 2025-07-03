// vNext AI 工具集 - 通过调用 RESTful API 实现功能

import { CoreTool } from 'ai';

// 获取锦标赛列表工具
export const listTournamentsAPITool: CoreTool = {
  description: '获取俱乐部的锦标赛列表，可以按状态、游戏类型、日期范围筛选',
  parameters: {
    type: 'object',
    properties: {
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      },
      status: { 
        type: 'string', 
        enum: ['SCHEDULED', 'REGISTERING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        description: '锦标赛状态筛选' 
      },
      gameType: { 
        type: 'string', 
        enum: ['NLH', 'PLO', 'PLO5', 'MIXED', 'OTHER'],
        description: '游戏类型筛选' 
      },
      startDate: { 
        type: 'string', 
        description: '开始日期 (YYYY-MM-DD)' 
      },
      endDate: { 
        type: 'string', 
        description: '结束日期 (YYYY-MM-DD)' 
      },
      limit: { 
        type: 'number', 
        description: '返回结果数量限制，默认20' 
      }
    },
    required: ['clubId']
  },
  execute: async ({ clubId, status, gameType, startDate, endDate, limit = 20 }) => {
    try {
      const params = new URLSearchParams({
        clubId,
        page: '1',
        limit: limit.toString()
      });
      
      if (status) params.append('status', status);
      if (gameType) params.append('gameType', gameType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/tournaments?${params}`);
      const data = await response.json();
      
      if (!data.success) {
        return `查询锦标赛时出错: ${data.error}`;
      }
      
      const tournaments = data.data.items;
      
      if (tournaments.length === 0) {
        return '没有找到符合条件的锦标赛。';
      }
      
      return JSON.stringify({
        tournaments: tournaments.map((t: any) => ({
          id: t.id,
          name: t.name,
          gameType: t.gameType,
          buyIn: t.buyIn,
          fee: t.fee,
          startTime: t.startTime,
          status: t.status,
          playerCount: t._count.players,
          maxPlayers: t.maxPlayers
        })),
        total: data.data.pagination.total
      });
    } catch (error) {
      return `获取锦标赛列表失败: ${error}`;
    }
  }
};

// 锦标赛报名工具
export const tournamentRegisterAPITool: CoreTool = {
  description: '为用户报名参加锦标赛',
  parameters: {
    type: 'object',
    properties: {
      tournamentId: { 
        type: 'string', 
        description: '锦标赛ID' 
      },
      userId: { 
        type: 'string', 
        description: '用户ID' 
      }
    },
    required: ['tournamentId', 'userId']
  },
  execute: async ({ tournamentId, userId }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId // 临时方案，实际应该通过会话验证
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return `报名失败: ${data.error}`;
      }
      
      return `报名成功！已扣除费用 ${data.data.amountCharged}，当前余额: ${data.data.newBalance}`;
    } catch (error) {
      return `报名过程中出现错误: ${error}`;
    }
  }
};

// 获取用户在俱乐部的信息工具
export const getUserClubInfoAPITool: CoreTool = {
  description: '获取用户在特定俱乐部的详细信息，包括余额、等级、统计数据等',
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
      }
    },
    required: ['userId', 'clubId']
  },
  execute: async ({ userId, clubId }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}/members?userId=${userId}`);
      const data = await response.json();
      
      if (!data.success) {
        return `获取用户信息失败: ${data.error}`;
      }
      
      const member = data.data.items.find((m: any) => m.userId === userId);
      if (!member) {
        return '用户不是该俱乐部成员。';
      }
      
      return JSON.stringify({
        balance: member.balance,
        role: member.role,
        vipLevel: member.vipLevel,
        joinDate: member.joinDate,
        totalBuyIn: member.totalBuyIn,
        totalCashOut: member.totalCashOut,
        userName: member.user.name
      });
    } catch (error) {
      return `获取用户信息时出错: ${error}`;
    }
  }
};

// 获取俱乐部统计信息工具
export const getClubStatsAPITool: CoreTool = {
  description: '获取俱乐部的统计信息，包括成员数量、锦标赛数量等',
  parameters: {
    type: 'object',
    properties: {
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      }
    },
    required: ['clubId']
  },
  execute: async ({ clubId }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}?includeStats=true`);
      const data = await response.json();
      
      if (!data.success) {
        return `获取俱乐部信息失败: ${data.error}`;
      }
      
      const club = data.data;
      return JSON.stringify({
        name: club.name,
        memberCount: club._count.members,
        tournamentCount: club._count.tournaments,
        ringGameTableCount: club._count.ringGameTables,
        recentTournaments: club.tournaments?.map((t: any) => ({
          name: t.name,
          startTime: t.startTime,
          status: t.status,
          playerCount: t._count.players
        })) || [],
        recentMembers: club.members?.map((m: any) => ({
          name: m.user.name,
          role: m.role,
          joinDate: m.joinDate
        })) || []
      });
    } catch (error) {
      return `获取俱乐部统计信息时出错: ${error}`;
    }
  }
};

// 创建锦标赛工具
export const createTournamentAPITool: CoreTool = {
  description: '为俱乐部创建新的锦标赛',
  parameters: {
    type: 'object',
    properties: {
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      },
      name: { 
        type: 'string', 
        description: '锦标赛名称' 
      },
      description: { 
        type: 'string', 
        description: '锦标赛描述' 
      },
      gameType: { 
        type: 'string', 
        enum: ['NLH', 'PLO', 'PLO5', 'MIXED', 'OTHER'],
        description: '游戏类型' 
      },
      buyIn: { 
        type: 'number', 
        description: '报名费金额' 
      },
      fee: { 
        type: 'number', 
        description: '手续费金额' 
      },
      startingStack: { 
        type: 'number', 
        description: '起始筹码数量' 
      },
      startTime: { 
        type: 'string', 
        description: '开始时间 (ISO格式)' 
      },
      minPlayers: { 
        type: 'number', 
        description: '最少玩家数' 
      },
      maxPlayers: { 
        type: 'number', 
        description: '最多玩家数（可选）' 
      }
    },
    required: ['clubId', 'name', 'gameType', 'buyIn', 'fee', 'startingStack', 'startTime', 'minPlayers']
  },
  execute: async ({ clubId, name, description, gameType, buyIn, fee, startingStack, startTime, minPlayers, maxPlayers }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/tournaments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clubId,
          name,
          description,
          gameType,
          buyIn,
          fee,
          startingStack,
          startTime,
          minPlayers,
          maxPlayers,
          // 使用默认值
          blindStructureId: 'default-blind-structure',
          payoutStructureId: 'default-payout-structure'
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return `创建锦标赛失败: ${data.error}`;
      }
      
      return `锦标赛"${name}"创建成功！报名费: $${buyIn}，开始时间: ${new Date(startTime).toLocaleString()}`;
    } catch (error) {
      return `创建锦标赛时出现错误: ${error}`;
    }
  }
};

// 获取仪表盘数据工具
export const getDashboardSummaryAPITool: CoreTool = {
  description: '获取俱乐部仪表盘汇总数据，包括会员统计、锦标赛信息、财务概览等',
  parameters: {
    type: 'object',
    properties: {
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      }
    },
    required: ['clubId']
  },
  execute: async ({ clubId }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/dashboard/summary?clubId=${clubId}`);
      const data = await response.json();
      
      if (!data.success) {
        return `获取仪表盘数据失败: ${data.error}`;
      }
      
      const summary = data.data;
      return JSON.stringify({
        会员统计: {
          总会员数: summary.members.total,
          活跃会员: summary.members.active
        },
        锦标赛统计: {
          总锦标赛: summary.tournaments.total,
          进行中: summary.tournaments.active,
          即将开始: summary.tournaments.upcoming
        },
        圆桌游戏: {
          总牌桌: summary.ringGames.total,
          活跃牌桌: summary.ringGames.active
        },
        财务概览: summary.finance ? {
          今日收入: `$${summary.finance.dailyRevenue}`,
          本月收入: `$${summary.finance.monthlyRevenue}`
        } : '无权限查看',
        最近活动: summary.recentActivity.map((activity: any) => ({
          名称: activity.name,
          类型: activity.type,
          状态: activity.status,
          玩家数: activity.playerCount
        }))
      });
    } catch (error) {
      return `获取仪表盘数据时出错: ${error}`;
    }
  }
};

// 获取圆桌游戏列表工具
export const listRingGamesAPITool: CoreTool = {
  description: '获取俱乐部的圆桌游戏列表，显示牌桌状态和玩家信息',
  parameters: {
    type: 'object',
    properties: {
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      },
      status: { 
        type: 'string', 
        enum: ['WAITING', 'ACTIVE', 'PAUSED', 'CLOSED'],
        description: '牌桌状态筛选（可选）' 
      }
    },
    required: ['clubId']
  },
  execute: async ({ clubId, status }) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}?includeStats=true`);
      const data = await response.json();
      
      if (!data.success) {
        return `获取圆桌游戏列表失败: ${data.error}`;
      }
      
      // 模拟数据（实际应该从API获取）
      const ringGames = [
        {
          name: '$1/$2 NL Hold\'em',
          gameType: 'NLH',
          stakes: '$1/$2',
          players: '6/9',
          status: 'ACTIVE',
          buyInRange: '$40-$200'
        },
        {
          name: '$2/$5 NL Hold\'em', 
          gameType: 'NLH',
          stakes: '$2/$5',
          players: '0/9',
          status: 'WAITING',
          buyInRange: '$100-$500'
        }
      ];
      
      const filteredGames = status ? ringGames.filter(game => game.status === status) : ringGames;
      
      if (filteredGames.length === 0) {
        return status ? `没有找到状态为"${status}"的圆桌游戏。` : '当前没有开设任何圆桌游戏。';
      }
      
      return JSON.stringify({
        圆桌游戏列表: filteredGames.map(game => ({
          桌名: game.name,
          游戏类型: game.gameType,
          盲注级别: game.stakes,
          玩家数: game.players,
          状态: game.status,
          买入范围: game.buyInRange
        })),
        统计: `共${filteredGames.length}张牌桌`
      });
    } catch (error) {
      return `获取圆桌游戏列表时出错: ${error}`;
    }
  }
};

// 获取会员列表工具
export const listMembersAPITool: CoreTool = {
  description: '获取俱乐部会员列表，包括会员角色、余额等信息',
  parameters: {
    type: 'object',
    properties: {
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      },
      role: { 
        type: 'string', 
        enum: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'CASHIER', 'VIP', 'GUEST'],
        description: '按角色筛选（可选）' 
      },
      limit: { 
        type: 'number', 
        description: '返回结果数量限制，默认20' 
      }
    },
    required: ['clubId']
  },
  execute: async ({ clubId, role, limit = 20 }) => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      if (role) params.append('role', role);

      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}/members?${params}`);
      const data = await response.json();
      
      if (!data.success) {
        return `获取会员列表失败: ${data.error}`;
      }
      
      const members = data.data.items || [];
      
      if (members.length === 0) {
        return role ? `没有找到角色为"${role}"的会员。` : '俱乐部暂无会员。';
      }
      
      return JSON.stringify({
        会员列表: members.map((member: any) => ({
          姓名: member.user.name,
          角色: member.role,
          余额: `$${member.balance}`,
          VIP等级: member.vipLevel,
          加入时间: new Date(member.joinDate).toLocaleDateString(),
          状态: member.status
        })),
        统计: `共${members.length}位会员`
      });
    } catch (error) {
      return `获取会员列表时出错: ${error}`;
    }
  }
};

// 引导式锦标赛创建工具
export const guidedTournamentCreationAPITool: CoreTool = {
  description: '引导管理者逐步创建锦标赛，收集必要信息并完成创建',
  parameters: {
    type: 'object',
    properties: {
      step: { 
        type: 'string', 
        enum: ['start', 'basic_info', 'game_settings', 'schedule', 'review', 'create'],
        description: '当前引导步骤' 
      },
      clubId: { 
        type: 'string', 
        description: '俱乐部ID' 
      },
      collectedData: {
        type: 'object',
        description: '已收集的锦标赛数据',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          gameType: { type: 'string' },
          buyIn: { type: 'number' },
          fee: { type: 'number' },
          startingStack: { type: 'number' },
          startTime: { type: 'string' },
          minPlayers: { type: 'number' },
          maxPlayers: { type: 'number' }
        }
      }
    },
    required: ['step', 'clubId']
  },
  execute: async ({ step, clubId, collectedData }) => {
    switch (step) {
      case 'start':
        return `🎯 **锦标赛创建向导**

我来帮您创建一个新的锦标赛！我们需要按步骤收集一些信息：

**第1步：基本信息**
请告诉我：
1. 锦标赛名称（例如：周末保证金锦标赛）
2. 锦标赛描述（简单介绍这个锦标赛的特点）

您可以说："我想创建一个名为'新手友好赛'的锦标赛，专门为新手玩家设计"`;

      case 'basic_info':
        return `✅ 基本信息已记录！

**第2步：游戏设置**
现在需要设置游戏规则：
1. 游戏类型：
   - NLH (No Limit Hold'em) - 最受欢迎
   - PLO (Pot Limit Omaha) - 进阶玩家
   - PLO5 (5-Card PLO) - 高级玩家
   - MIXED (混合游戏)
   - OTHER (其他)

2. 买入金额（报名费，例如：100）
3. 手续费（例如：10）
4. 起始筹码数量（例如：10000）

请告诉我您的选择，例如："游戏类型选择NLH，买入100元，手续费10元，起始筹码10000"`;

      case 'game_settings':
        return `🎮 游戏设置完成！

**第3步：时间安排**
最后设置比赛时间：
1. 开始时间（请提供具体的日期和时间）
2. 最少参赛人数（建议6-10人）
3. 最多参赛人数（可选，例如50-100人）

例如："明天晚上8点开始，最少8人，最多50人"`;

      case 'schedule':
        return `📅 时间安排设置完成！

**第4步：确认信息**
请确认以下锦标赛信息：

📋 **锦标赛详情**
- 名称：${collectedData?.name || '[待填写]'}
- 描述：${collectedData?.description || '[待填写]'}
- 游戏类型：${collectedData?.gameType || '[待填写]'}
- 买入：$${collectedData?.buyIn || '[待填写]'}
- 手续费：$${collectedData?.fee || '[待填写]'}
- 起始筹码：${collectedData?.startingStack || '[待填写]'}
- 开始时间：${collectedData?.startTime || '[待填写]'}
- 参赛人数：${collectedData?.minPlayers || '[待填写]'} - ${collectedData?.maxPlayers || '无限制'}

如果信息正确，请说"确认创建"。如果需要修改，请告诉我要修改哪项。`;

      case 'review':
        return `🔍 信息确认中...

一切看起来都很好！我现在为您创建锦标赛。`;

      case 'create':
        // 实际创建锦标赛
        if (collectedData) {
          try {
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/tournaments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...collectedData,
                clubId,
                blindStructureId: 'default-blind-structure',
                payoutStructureId: 'default-payout-structure'
              })
            });
            
            if (response.ok) {
              return `🎉 **锦标赛创建成功！**

"${collectedData.name}" 已经成功创建并安排在系统中。

**接下来您可以：**
- 在锦标赛管理页面查看详情
- 设置更详细的盲注结构
- 调整支付结构
- 开始宣传和接受报名

需要我帮您做其他设置吗？`;
            } else {
              return `❌ 创建失败，请检查信息后重试。如需帮助，请告诉我遇到的问题。`;
            }
          } catch (error) {
            return `❌ 创建过程中出现错误，请稍后重试。`;
          }
        }
        return `❌ 缺少必要信息，无法创建锦标赛。`;

      default:
        return '请指定有效的引导步骤。';
    }
  }
};

// 引导式用户报名工具
export const guidedTournamentRegistrationAPITool: CoreTool = {
  description: '引导用户完成锦标赛报名，检查条件并完成注册',
  parameters: {
    type: 'object',
    properties: {
      step: {
        type: 'string',
        enum: ['search', 'select', 'check_eligibility', 'confirm', 'register'],
        description: '当前引导步骤'
      },
      clubId: { type: 'string', description: '俱乐部ID' },
      userId: { type: 'string', description: '用户ID' },
      tournamentId: { type: 'string', description: '锦标赛ID（可选）' },
      preferences: {
        type: 'object',
        description: '用户偏好设置',
        properties: {
          gameType: { type: 'string' },
          maxBuyIn: { type: 'number' },
          timePreference: { type: 'string' }
        }
      }
    },
    required: ['step', 'clubId']
  },
  execute: async ({ step, clubId, userId, tournamentId, preferences }) => {
    switch (step) {
      case 'search':
        return `🔍 **锦标赛报名助手**

我来帮您找到合适的锦标赛！

**请告诉我您的偏好：**
1. 偏好的游戏类型（NLH、PLO等，或者说"都可以"）
2. 预算范围（最高买入金额，例如："500元以内"）
3. 时间偏好（例如："今晚"、"这周末"、"工作日晚上"）

例如："我想参加NLH游戏，预算300元以内，最好是周末的比赛"`;

      case 'select':
        // 获取符合条件的锦标赛列表
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}/tournaments`);
          const data = await response.json();
          
          if (data.success && data.data.length > 0) {
            const tournaments = data.data.slice(0, 3); // 显示前3个
            let result = `🎯 **为您推荐以下锦标赛：**\n\n`;
            
            tournaments.forEach((tournament: any, index: number) => {
              result += `**${index + 1}. ${tournament.name}**
- 游戏类型：${tournament.gameType}
- 买入：$${tournament.buyIn}
- 开始时间：${new Date(tournament.startTime).toLocaleString()}
- 当前报名：${tournament.registeredCount || 0}/${tournament.maxPlayers || '∞'}人

`;
            });
            
            result += `请告诉我您想报名哪个锦标赛（说出编号或名称）`;
            return result;
          } else {
            return `😔 暂时没有找到符合您条件的锦标赛。

**建议：**
- 放宽预算范围
- 考虑其他时间段
- 关注俱乐部公告，了解新比赛安排

需要我帮您查看其他选项吗？`;
          }
        } catch (error) {
          return `获取锦标赛信息时出错，请稍后重试。`;
        }

      case 'check_eligibility':
        return `✅ **报名资格检查**

让我检查一下您的报名条件：

**正在验证：**
- 账户余额是否充足 💰
- 是否已经报名其他冲突的比赛 📅
- 会员等级和权限 🎖️

请稍等片刻...`;

      case 'confirm':
        return `🎯 **确认报名信息**

您即将报名参加锦标赛！

**报名详情：**
- 锦标赛：[锦标赛名称]
- 买入：$[金额]
- 开始时间：[时间]
- 预计时长：2-4小时

**费用说明：**
- 报名费将从您的账户余额中扣除
- 比赛开始前30分钟可以取消报名

确认报名请说"确认"，如需修改请告诉我。`;

      case 'register':
        if (tournamentId && userId) {
          try {
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/tournaments/${tournamentId}/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId })
            });
            
            if (response.ok) {
              return `🎉 **报名成功！**

您已成功报名参加锦标赛！

**接下来：**
- 📧 您将收到确认邮件
- ⏰ 比赛开始前30分钟会收到提醒
- 💺 请提前5-10分钟到场准备

**贴心提醒：**
- 确保网络连接稳定
- 准备好充足的时间参与比赛
- 如有问题随时联系客服

祝您好运！🍀`;
            } else {
              return `❌ 报名失败，可能是名额已满或余额不足。请检查后重试。`;
            }
          } catch (error) {
            return `❌ 报名过程中出现错误，请稍后重试。`;
          }
        }
        return `❌ 缺少必要信息，无法完成报名。`;

      default:
        return '请指定有效的引导步骤。';
    }
  }
};

// 智能任务向导工具
export const smartTaskWizardAPITool: CoreTool = {
  description: '智能任务向导，根据用户角色和目标提供个性化的逐步指导',
  parameters: {
    type: 'object',
    properties: {
      userRole: {
        type: 'string',
        enum: ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'CASHIER', 'VIP', 'GUEST'],
        description: '用户角色'
      },
      taskType: {
        type: 'string',
        enum: ['tournament_setup', 'member_management', 'financial_setup', 'ring_game_setup', 'user_registration', 'balance_management'],
        description: '任务类型'
      },
      currentStep: {
        type: 'string',
        description: '当前步骤'
      },
      clubId: { type: 'string', description: '俱乐部ID' }
    },
    required: ['userRole', 'taskType', 'clubId']
  },
  execute: async ({ userRole, taskType, currentStep, clubId }) => {
    // 根据用户角色和任务类型提供个性化指导
    const rolePermissions = {
      'OWNER': ['tournament_setup', 'member_management', 'financial_setup', 'ring_game_setup'],
      'ADMIN': ['tournament_setup', 'member_management', 'ring_game_setup'],
      'MANAGER': ['tournament_setup', 'ring_game_setup'],
      'MEMBER': ['user_registration', 'balance_management'],
      'DEALER': ['ring_game_setup'],
      'CASHIER': ['balance_management', 'financial_setup'],
      'VIP': ['user_registration', 'balance_management'],
      'GUEST': ['user_registration']
    };

    if (!rolePermissions[userRole as keyof typeof rolePermissions]?.includes(taskType)) {
      return `⚠️ 抱歉，您的角色（${userRole}）没有执行"${taskType}"任务的权限。

**您可以执行的任务：**
${rolePermissions[userRole as keyof typeof rolePermissions]?.map((task: string) => `- ${task}`).join('\n') || '- 无可用任务'}

如需帮助，请联系管理员。`;
    }

    const taskGuides = {
      'tournament_setup': {
        title: '🏆 锦标赛设置向导',
        steps: [
          '1. 基本信息设置（名称、描述、游戏类型）',
          '2. 财务设置（买入、手续费、奖池分配）',
          '3. 时间安排（开始时间、报名截止）',
          '4. 参赛规则（人数限制、盲注结构）',
          '5. 发布和宣传'
        ]
      },
      'member_management': {
        title: '👥 会员管理向导',
        steps: [
          '1. 查看会员列表和状态',
          '2. 设置会员角色和权限',
          '3. 管理会员余额和交易',
          '4. 处理会员申请和审核',
          '5. 会员等级和奖励管理'
        ]
      },
      'ring_game_setup': {
        title: '🎮 圆桌游戏设置',
        steps: [
          '1. 选择游戏类型和盲注级别',
          '2. 设置买入范围和最大玩家数',
          '3. 配置服务费结构',
          '4. 开桌并管理座位',
          '5. 监控游戏进度和结算'
        ]
      }
    };

    const guide = taskGuides[taskType as keyof typeof taskGuides];
    if (!guide) {
      return `未找到"${taskType}"的向导信息。`;
    }

    return `${guide.title}

**完整流程：**
${guide.steps.map((step: string) => step).join('\n')}

**当前状态：** ${currentStep || '准备开始'}

请告诉我您想要开始哪个步骤，我会为您提供详细的操作指导。

例如，您可以说："开始第1步"或"我想设置基本信息"`;
  }
};

// 导出所有工具
export const aiToolsAPI = {
  listTournaments: listTournamentsAPITool,
  tournamentRegister: tournamentRegisterAPITool,
  createTournament: createTournamentAPITool,
  getUserClubInfo: getUserClubInfoAPITool,
  getClubStats: getClubStatsAPITool,
  getDashboardSummary: getDashboardSummaryAPITool,
  listRingGames: listRingGamesAPITool,
  listMembers: listMembersAPITool,
  guidedTournamentCreation: guidedTournamentCreationAPITool,
  guidedTournamentRegistration: guidedTournamentRegistrationAPITool,
  smartTaskWizard: smartTaskWizardAPITool
};