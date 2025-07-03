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
        最近活动: summary.recentActivity.map(activity => ({
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

// 导出所有工具
export const aiToolsAPI = {
  listTournaments: listTournamentsAPITool,
  tournamentRegister: tournamentRegisterAPITool,
  createTournament: createTournamentAPITool,
  getUserClubInfo: getUserClubInfoAPITool,
  getClubStats: getClubStatsAPITool,
  getDashboardSummary: getDashboardSummaryAPITool,
  listRingGames: listRingGamesAPITool,
  listMembers: listMembersAPITool
};