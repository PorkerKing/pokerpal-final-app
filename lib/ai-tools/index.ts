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
        cashGameTableCount: club._count.cashGameTables,
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

// 导出所有工具
export const aiToolsAPI = {
  listTournaments: listTournamentsAPITool,
  tournamentRegister: tournamentRegisterAPITool,
  getUserClubInfo: getUserClubInfoAPITool,
  getClubStats: getClubStatsAPITool
};