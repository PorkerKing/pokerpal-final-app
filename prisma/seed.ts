// 数据库种子文件 - 创建测试数据

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建种子数据...');

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@pokerpal.com' },
    update: {},
    create: {
      name: '管理员',
      email: 'admin@pokerpal.com',
      password: hashedPassword,
      preferredLanguage: 'zh'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'player1@pokerpal.com' },
    update: {},
    create: {
      name: '玩家一号',
      email: 'player1@pokerpal.com',
      password: hashedPassword,
      preferredLanguage: 'zh'
    }
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'player2@pokerpal.com' },
    update: {},
    create: {
      name: '玩家二号',
      email: 'player2@pokerpal.com',
      password: hashedPassword,
      preferredLanguage: 'zh'
    }
  });

  // 创建示例俱乐部
  const club = await prisma.club.upsert({
    where: { name: 'PokerPal 示例俱乐部' },
    update: {},
    create: {
      name: 'PokerPal 示例俱乐部',
      description: '这是一个用于演示的扑克俱乐部',
      timezone: 'Asia/Shanghai',
      currency: 'CNY',
      isActive: true,
      settings: {
        allowGuestChat: true,
        autoApproveMembers: false,
        maxTablesPerUser: 3
      }
    }
  });

  // 创建 AI 角色
  await prisma.aIPersona.upsert({
    where: { clubId: club.id },
    update: {},
    create: {
      clubId: club.id,
      name: 'PokerPal 助手',
      personality: '我是一个专业、友好的扑克俱乐部助手。我了解扑克规则，能够帮助用户报名参加锦标赛，查询战绩，并提供各种俱乐部服务。我总是礼貌耐心，用简洁明了的语言回答问题。',
      systemPrompt: '你是 PokerPal 示例俱乐部的专属AI助手。请用中文与用户交流，提供专业的扑克俱乐部服务。',
      capabilities: {
        tournaments: true,
        ringGames: true,
        memberManagement: true,
        statistics: true
      }
    }
  });

  // 创建俱乐部成员
  await prisma.clubMember.upsert({
    where: {
      clubId_userId: {
        clubId: club.id,
        userId: user1.id
      }
    },
    update: {},
    create: {
      clubId: club.id,
      userId: user1.id,
      role: 'OWNER',
      status: 'ACTIVE',
      balance: 10000.00,
      totalBuyIn: 0,
      totalCashOut: 0,
      vipLevel: 3
    }
  });

  await prisma.clubMember.upsert({
    where: {
      clubId_userId: {
        clubId: club.id,
        userId: user2.id
      }
    },
    update: {},
    create: {
      clubId: club.id,
      userId: user2.id,
      role: 'MEMBER',
      status: 'ACTIVE',
      balance: 5000.00,
      totalBuyIn: 2000.00,
      totalCashOut: 1500.00,
      vipLevel: 1
    }
  });

  await prisma.clubMember.upsert({
    where: {
      clubId_userId: {
        clubId: club.id,
        userId: user3.id
      }
    },
    update: {},
    create: {
      clubId: club.id,
      userId: user3.id,
      role: 'MEMBER',
      status: 'ACTIVE',
      balance: 3000.00,
      totalBuyIn: 1000.00,
      totalCashOut: 800.00,
      vipLevel: 2
    }
  });

  // 创建会员等级
  await prisma.membershipTier.createMany({
    data: [
      {
        clubId: club.id,
        name: '铜牌会员',
        level: 1,
        minPointsRequired: 0,
        minGamesRequired: 0,
        benefits: ['基础聊天功能', '参与锦标赛'],
        color: '#CD7F32',
        isActive: true
      },
      {
        clubId: club.id,
        name: '银牌会员',
        level: 2,
        minPointsRequired: 1000,
        minGamesRequired: 10,
        benefits: ['优先报名', '专属客服', '月度奖励'],
        color: '#C0C0C0',
        isActive: true
      },
      {
        clubId: club.id,
        name: '金牌会员',
        level: 3,
        minPointsRequired: 5000,
        minGamesRequired: 50,
        benefits: ['VIP待遇', '定制服务', '专属活动'],
        color: '#FFD700',
        isActive: true
      }
    ],
    skipDuplicates: true
  });

  // 创建盲注结构
  const blindStructure = await prisma.blindStructure.upsert({
    where: { id: 'default-blind-structure' },
    update: {},
    create: {
      id: 'default-blind-structure',
      clubId: club.id,
      name: '标准锦标赛盲注',
      description: '适用于大多数锦标赛的标准盲注结构',
      levels: [
        { level: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 15 },
        { level: 2, smallBlind: 15, bigBlind: 30, ante: 0, duration: 15 },
        { level: 3, smallBlind: 25, bigBlind: 50, ante: 0, duration: 15 },
        { level: 4, smallBlind: 50, bigBlind: 100, ante: 0, duration: 15 },
        { level: 5, smallBlind: 75, bigBlind: 150, ante: 0, duration: 15 },
        { level: 6, smallBlind: 100, bigBlind: 200, ante: 25, duration: 15 },
        { level: 7, smallBlind: 150, bigBlind: 300, ante: 25, duration: 15 },
        { level: 8, smallBlind: 200, bigBlind: 400, ante: 50, duration: 15 }
      ]
    }
  });

  // 创建支付结构
  const payoutStructure = await prisma.payoutStructure.upsert({
    where: { id: 'default-payout-structure' },
    update: {},
    create: {
      id: 'default-payout-structure',
      clubId: club.id,
      name: '标准支付结构',
      description: '适用于大多数锦标赛的标准支付比例',
      payouts: [
        { position: 1, percentage: 50 },
        { position: 2, percentage: 30 },
        { position: 3, percentage: 20 }
      ]
    }
  });

  // 创建示例锦标赛
  const tournament1 = await prisma.tournament.create({
    data: {
      clubId: club.id,
      name: '每日保证金锦标赛',
      description: '每日举办的保证金锦标赛，适合所有水平的玩家',
      gameType: 'NLH',
      buyIn: 100.00,
      fee: 10.00,
      startingStack: 10000,
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2小时后开始
      minPlayers: 6,
      maxPlayers: 100,
      status: 'SCHEDULED',
      blindStructureId: blindStructure.id,
      payoutStructureId: payoutStructure.id,
      tags: ['daily', 'guarantee']
    }
  });

  const tournament2 = await prisma.tournament.create({
    data: {
      clubId: club.id,
      name: '周末大型锦标赛',
      description: '周末特别举办的大型锦标赛，奖池丰厚',
      gameType: 'NLH',
      buyIn: 500.00,
      fee: 50.00,
      startingStack: 20000,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后开始
      minPlayers: 20,
      maxPlayers: 200,
      status: 'SCHEDULED',
      blindStructureId: blindStructure.id,
      payoutStructureId: payoutStructure.id,
      tags: ['weekend', 'major']
    }
  });

  // 创建服务费结构
  await prisma.serviceFeeStructure.upsert({
    where: { id: 'default-service-fee-structure' },
    update: {},
    create: {
      id: 'default-service-fee-structure',
      clubId: club.id,
      name: '标准服务费',
      percentage: 5.0,
      cap: 10.00,
    }
  });

  // 创建一些交易记录
  await prisma.transaction.createMany({
    data: [
      {
        userId: user1.id,
        clubId: club.id,
        type: 'DEPOSIT',
        amount: 10000.00,
        balanceBefore: 0,
        balanceAfter: 10000.00,
        description: '初始充值',
        reference: 'TXN-INIT-001'
      },
      {
        userId: user2.id,
        clubId: club.id,
        type: 'DEPOSIT',
        amount: 5000.00,
        balanceBefore: 0,
        balanceAfter: 5000.00,
        description: '初始充值',
        reference: 'TXN-INIT-002'
      },
      {
        userId: user3.id,
        clubId: club.id,
        type: 'DEPOSIT',
        amount: 3000.00,
        balanceBefore: 0,
        balanceAfter: 3000.00,
        description: '初始充值',
        reference: 'TXN-INIT-003'
      }
    ],
    skipDuplicates: true
  });

  console.log('种子数据创建完成!');
  console.log('俱乐部信息:');
  console.log(`  - 俱乐部ID: ${club.id}`);
  console.log(`  - 俱乐部名称: ${club.name}`);
  console.log('测试用户:');
  console.log(`  - 管理员: ${user1.email} (密码: password123)`);
  console.log(`  - 玩家1: ${user2.email} (密码: password123)`);
  console.log(`  - 玩家2: ${user3.email} (密码: password123)`);
  console.log('锦标赛:');
  console.log(`  - ${tournament1.name} (ID: ${tournament1.id})`);
  console.log(`  - ${tournament2.name} (ID: ${tournament2.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });