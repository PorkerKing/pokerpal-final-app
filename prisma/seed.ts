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

  const dealerUser = await prisma.user.upsert({
    where: { email: 'dealer@pokerpal.com' },
    update: {},
    create: {
      name: '荷官小王',
      email: 'dealer@pokerpal.com',
      password: hashedPassword,
      preferredLanguage: 'zh'
    }
  });

  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@pokerpal.com' },
    update: {},
    create: {
      name: '出纳小李',
      email: 'cashier@pokerpal.com',
      password: hashedPassword,
      preferredLanguage: 'zh'
    }
  });

  // 创建4个特定俱乐部
  
  // 1. 上海扑克会所 (专业严谨，金融圈玩家)
  const shanghaiClub = await prisma.club.upsert({
    where: { name: '上海扑克会所' },
    update: {},
    create: {
      name: '上海扑克会所',
      description: '面向金融圈专业人士的高端扑克俱乐部，注重专业性与严谨的游戏体验',
      timezone: 'Asia/Shanghai',
      currency: 'CNY',
      isActive: true,
      settings: {
        allowGuestChat: false,
        autoApproveMembers: false,
        maxTablesPerUser: 2
      }
    }
  });

  // 2. 台北德州俱乐部 (亲和友好，注重社交)
  const taipeiClub = await prisma.club.upsert({
    where: { name: '台北德州俱乐部' },
    update: {},
    create: {
      name: '台北德州俱乐部',
      description: '充满温馨社交氛围的台北扑克俱乐部，欢迎各界朋友交流切磋',
      timezone: 'Asia/Taipei',
      currency: 'TWD',
      isActive: true,
      settings: {
        allowGuestChat: true,
        autoApproveMembers: true,
        maxTablesPerUser: 4
      }
    }
  });

  // 3. 大阪ポーカーハウス (尊敬礼貌，传统日式)
  const osakaClub = await prisma.club.upsert({
    where: { name: '大阪ポーカーハウス' },
    update: {},
    create: {
      name: '大阪ポーカーハウス',
      description: '秉承日式传统礼仪的扑克俱乐部，营造尊重礼貌的游戏环境',
      timezone: 'Asia/Tokyo',
      currency: 'JPY',
      isActive: true,
      settings: {
        allowGuestChat: true,
        autoApproveMembers: false,
        maxTablesPerUser: 3
      }
    }
  });

  // 4. 吉隆坡扑克联盟 (多元包容，国际化)
  const kualaLumpurClub = await prisma.club.upsert({
    where: { name: '吉隆坡扑克联盟' },
    update: {},
    create: {
      name: '吉隆坡扑克联盟',
      description: '多元文化融合的国际化扑克平台，欢迎来自世界各地的牌手',
      timezone: 'Asia/Kuala_Lumpur',
      currency: 'MYR',
      isActive: true,
      settings: {
        allowGuestChat: true,
        autoApproveMembers: true,
        maxTablesPerUser: 5
      }
    }
  });

  const clubs = [shanghaiClub, taipeiClub, osakaClub, kualaLumpurClub];

  // 为每个俱乐部创建对应的 AI 角色
  
  // 上海扑克会所 - 专业严谨
  await prisma.aIPersona.upsert({
    where: { clubId: shanghaiClub.id },
    update: {},
    create: {
      clubId: shanghaiClub.id,
      name: '金融AI顾问',
      personality: '我是上海扑克会所的专业AI助手，专为金融圈精英服务。我的回复严谨专业，用词精准，熟悉金融术语。我注重效率和数据分析，能够提供专业的扑克策略建议和俱乐部运营数据分析。',
      systemPrompt: '你是上海扑克会所的专属AI助手，服务对象主要是金融圈专业人士。请保持专业严谨的风格，使用准确的金融和扑克术语，重点关注数据分析和策略建议。',
      capabilities: {
        tournaments: true,
        ringGames: true,
        memberManagement: true,
        statistics: true
      }
    }
  });

  // 台北德州俱乐部 - 亲和友好
  await prisma.aIPersona.upsert({
    where: { clubId: taipeiClub.id },
    update: {},
    create: {
      clubId: taipeiClub.id,
      name: '台北小助手',
      personality: '我是台北德州俱乐部的AI助手，个性亲切友好，就像邻家朋友一样温暖。我喜欢用轻松的语气与大家聊天，经常使用表情符号，关心每位会员的需求，致力于营造温馨的社交氛围。',
      systemPrompt: '你是台北德州俱乐部的AI助手，请保持亲切友好的语调，多使用温暖的表达方式和适当的表情符号，重点关注会员的社交体验和互动。',
      capabilities: {
        tournaments: true,
        ringGames: true,
        memberManagement: true,
        statistics: true
      }
    }
  });

  // 大阪ポーカーハウス - 尊敬礼貌
  await prisma.aIPersona.upsert({
    where: { clubId: osakaClub.id },
    update: {},
    create: {
      clubId: osakaClub.id,
      name: 'ポーカー案内人',
      personality: '私は大阪ポーカーハウスのAIアシスタントです。日本の伝統的な礼儀を重んじ、常に丁寧語でお話しします。お客様一人ひとりを大切にし、心のこもったサービスを提供いたします。ポーカーのマナーと楽しさを両立できるようサポートします。',
      systemPrompt: '你是大阪ポーカーハウス的AI助手，请遵循日式传统礼仪，使用敬语和礼貌用词，体现日本式的细致周到服务精神。可以适当使用日语词汇增加特色。',
      capabilities: {
        tournaments: true,
        ringGames: true,
        memberManagement: true,
        statistics: true
      }
    }
  });

  // 吉隆坡扑克联盟 - 多元包容
  await prisma.aIPersona.upsert({
    where: { clubId: kualaLumpurClub.id },
    update: {},
    create: {
      clubId: kualaLumpurClub.id,
      name: 'Global Poker Assistant',
      personality: 'I am the AI assistant for Kuala Lumpur Poker Alliance, embracing diversity and multiculturalism. I can communicate in multiple languages and understand different cultural backgrounds. I am inclusive, welcoming, and help create a harmonious international community where players from all walks of life can enjoy poker together.',
      systemPrompt: '你是吉隆坡扑克联盟的AI助手，请体现国际化和多元包容的特色。可以适当使用英语词汇，关注来自不同文化背景的用户需求，营造国际化氛围。',
      capabilities: {
        tournaments: true,
        ringGames: true,
        memberManagement: true,
        statistics: true
      }
    }
  });

  // 为每个俱乐部创建成员
  for (const club of clubs) {
    // 管理员作为OWNER
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

    // 玩家1作为普通会员
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

    // 玩家2作为普通会员
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

    // 荷官
    await prisma.clubMember.upsert({
      where: {
        clubId_userId: {
          clubId: club.id,
          userId: dealerUser.id
        }
      },
      update: {},
      create: {
        clubId: club.id,
        userId: dealerUser.id,
        role: 'DEALER',
        status: 'ACTIVE',
        balance: 0.00,
        totalBuyIn: 0.00,
        totalCashOut: 0.00,
        vipLevel: 1
      }
    });

    // 出纳
    await prisma.clubMember.upsert({
      where: {
        clubId_userId: {
          clubId: club.id,
          userId: cashierUser.id
        }
      },
      update: {},
      create: {
        clubId: club.id,
        userId: cashierUser.id,
        role: 'CASHIER',
        status: 'ACTIVE',
        balance: 0.00,
        totalBuyIn: 0.00,
        totalCashOut: 0.00,
        vipLevel: 1
      }
    });

    // 为每个俱乐部创建会员等级
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
  }

  // 为每个俱乐部创建配置数据
  for (let i = 0; i < clubs.length; i++) {
    const club = clubs[i];
    
    // 创建盲注结构
    const blindStructure = await prisma.blindStructure.upsert({
      where: { id: `blind-structure-${club.id}` },
      update: {},
      create: {
        id: `blind-structure-${club.id}`,
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
      where: { id: `payout-structure-${club.id}` },
      update: {},
      create: {
        id: `payout-structure-${club.id}`,
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

    // 为每个俱乐部创建不同特色的锦标赛
    const tournamentNames = [
      ['金融圈精英赛', '专业交易员锦标赛'],
      ['台北友谊赛', '温馨家庭锦标赛'],
      ['大阪礼仪杯', '传统和风锦标赛'],
      ['国际融合赛', '多元文化锦标赛']
    ];

    const tournament1 = await prisma.tournament.create({
      data: {
        clubId: club.id,
        name: tournamentNames[i][0],
        description: `${club.name}的特色锦标赛，体现俱乐部独特文化`,
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
        tags: ['signature', 'featured']
      }
    });

    const tournament2 = await prisma.tournament.create({
      data: {
        clubId: club.id,
        name: tournamentNames[i][1],
        description: `${club.name}的高级锦标赛，奖池丰厚`,
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
        tags: ['premium', 'major']
      }
    });

    // 创建服务费结构
    await prisma.serviceFeeStructure.upsert({
      where: { id: `service-fee-${club.id}` },
      update: {},
      create: {
        id: `service-fee-${club.id}`,
        clubId: club.id,
        name: '标准服务费',
        percentage: 5.0,
        cap: 10.00,
      }
    });

    // 为每个俱乐部创建交易记录
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
          reference: `TXN-${club.id}-001`
        },
        {
          userId: user2.id,
          clubId: club.id,
          type: 'DEPOSIT',
          amount: 5000.00,
          balanceBefore: 0,
          balanceAfter: 5000.00,
          description: '初始充值',
          reference: `TXN-${club.id}-002`
        },
        {
          userId: user3.id,
          clubId: club.id,
          type: 'DEPOSIT',
          amount: 3000.00,
          balanceBefore: 0,
          balanceAfter: 3000.00,
          description: '初始充值',
          reference: `TXN-${club.id}-003`
        }
      ],
      skipDuplicates: true
    });
  }

  // 为每个俱乐部创建特色商城物品
  const storeItemsData = [
    // 上海扑克会所 - 专业高端精致
    {
      clubIndex: 0,
      items: [
        {
          name: '外滩特调："东方之珠"',
          description: '由俱乐部首席调酒师为资深牌手设计的威士忌特调鸡尾酒，口感醇厚，回味悠长。',
          pointsRequired: 2500,
          category: 'BEVERAGE',
          isActive: true,
          stock: 50
        },
        {
          name: 'PokerPal 定制版丝光棉T恤',
          description: '黑色丝光棉材质，胸前有暗纹刺绣的PokerPal Logo，低调而彰显身份。',
          pointsRequired: 8000,
          category: 'MERCHANDISE',
          isActive: true,
          stock: 30
        },
        {
          name: '私人牌技教练1小时课程',
          description: '与俱乐部签约的职业教练进行一对一的牌谱复盘与GTO策略指导。',
          pointsRequired: 50000,
          category: 'SERVICE',
          isActive: true,
          stock: 10
        },
        {
          name: 'JOPT东南亚拓展赛主赛门票',
          description: '(顶级兑换) 兑换2025年12月于新加坡举办的JOPT主赛事资格，与亚洲顶级玩家同台竞技。',
          pointsRequired: 1500000,
          category: 'TOURNAMENT_TICKET',
          isActive: true,
          stock: 2
        }
      ]
    },
    // 台北德州俱乐部 - 甜美潮流社交
    {
      clubIndex: 1,
      items: [
        {
          name: '心怡特调：满杯红柚',
          description: '新鲜红柚果粒搭配清爽绿茶，是心怡妹妹最推荐的夏日解压饮品喔！',
          pointsRequired: 1800,
          category: 'BEVERAGE',
          isActive: true,
          stock: 60
        },
        {
          name: '"稳住，我们能赢"文创帆布袋',
          description: '台北本地设计师合作款，印有俱乐部热门口号，是牌友间身份认同的象征。',
          pointsRequired: 6500,
          category: 'MERCHANDISE',
          isActive: true,
          stock: 40
        },
        {
          name: '双人下午茶套餐',
          description: '兑换与俱乐部合作的网红咖啡厅双人下午茶一份，适合带上牌友一起放松聊天。',
          pointsRequired: 15000,
          category: 'SERVICE',
          isActive: true,
          stock: 20
        },
        {
          name: '澳门扑克杯(MPC)边赛门票',
          description: '兑换下一届澳门扑克杯任意一场$2000港币买入边赛的门票，体验亚洲顶级赛事氛围。',
          pointsRequired: 300000,
          category: 'TOURNAMENT_TICKET',
          isActive: true,
          stock: 5
        }
      ]
    },
    // 大阪ポーカーハウス - 活力热情直接
    {
      clubIndex: 2,
      items: [
        {
          name: '道頓堀必胜能量饮',
          description: '由美推荐！比赛前来一罐，保证你元气满满，All-in都有劲！',
          pointsRequired: 1500,
          category: 'BEVERAGE',
          isActive: true,
          stock: 80
        },
        {
          name: '"一撃必殺"主题棒球帽',
          description: '设计大胆的棒球帽，正面印有"一撃必殺"书法字样，戴上它，气势上就赢了！',
          pointsRequired: 7000,
          category: 'MERCHANDISE',
          isActive: true,
          stock: 35
        },
        {
          name: '章鱼烧大师制作券',
          description: '凭券可到俱乐部吧台，让由美亲自为你制作一份道頓堀最正宗的章鱼烧！',
          pointsRequired: 12000,
          category: 'SERVICE',
          isActive: true,
          stock: 25
        },
        {
          name: 'APPT首尔站主赛资格',
          description: '兑换下一届亚太扑克巡回赛(APPT)首尔站主赛事第一轮的参赛资格。',
          pointsRequired: 500000,
          category: 'TOURNAMENT_TICKET',
          isActive: true,
          stock: 3
        }
      ]
    },
    // 吉隆坡扑克联盟 - 专业国际沉稳
    {
      clubIndex: 3,
      items: [
        {
          name: "Aisha's Signature White Coffee",
          description: '精选怡保上等咖啡豆，由Aisha亲手冲泡的正宗白咖啡，口感丝滑，提神醒脑。',
          pointsRequired: 2000,
          category: 'BEVERAGE',
          isActive: true,
          stock: 45
        },
        {
          name: 'KL Champions Lounge 纪念筹码套装',
          description: '一套制作精良、手感厚重的俱乐部定制纪念筹码，附带皮质收藏盒。',
          pointsRequired: 18000,
          category: 'MERCHANDISE',
          isActive: true,
          stock: 15
        },
        {
          name: '五星级酒店水疗体验券',
          description: '与吉隆坡市中心五星级酒店合作，为在牌桌上鏖战后的您提供一次彻底放松的SPA体验。',
          pointsRequired: 80000,
          category: 'SERVICE',
          isActive: true,
          stock: 8
        },
        {
          name: 'JOPT东南亚拓展赛主赛门票',
          description: '(顶级兑换) 兑换2025年12月于新加坡举办的JOPT主赛事资格，代表俱乐部出征。',
          pointsRequired: 1500000,
          category: 'TOURNAMENT_TICKET',
          isActive: true,
          stock: 2
        }
      ]
    }
  ];

  // 创建商城物品
  for (const storeData of storeItemsData) {
    const club = clubs[storeData.clubIndex];
    
    for (const item of storeData.items) {
      await prisma.storeItem.create({
        data: {
          clubId: club.id,
          name: item.name,
          description: item.description,
          pointsRequired: item.pointsRequired,
          category: item.category,
          isActive: item.isActive,
          stock: item.stock
        }
      });
    }
  }

  // 为每个俱乐部创建额外的特色锦标赛
  const additionalTournamentsData = [
    // 上海扑克会所
    {
      clubIndex: 0,
      tournaments: [
        {
          name: '午间快速资格赛',
          description: '一场快节奏的卫星赛，冠军将获得当晚主赛事的门票。',
          gameType: 'NLH',
          buyIn: 100.00,
          fee: 10.00,
          startingStack: 5000,
          startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6小时后
          minPlayers: 6,
          maxPlayers: 50,
          status: 'SCHEDULED',
          tags: ['satellite', 'qualifier']
        }
      ]
    },
    // 台北德州俱乐部
    {
      clubIndex: 1,
      tournaments: [
        {
          name: '周末夜市派对赏金赛',
          description: '氛围轻松的PKO赏金赛，每淘汰一名对手都能获得即时奖励，充满乐趣。',
          gameType: 'NLH',
          buyIn: 500.00,
          fee: 500.00,
          startingStack: 15000,
          startTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12小时后
          minPlayers: 10,
          maxPlayers: 80,
          status: 'SCHEDULED',
          tags: ['pko', 'bounty', 'weekend']
        },
        {
          name: '新手友好练习赛 (Freeroll)',
          description: '免费参加！专为新手准备的练习赛，让新朋友无压力体验比赛乐趣，前三名还有奶茶券奖励喔！',
          gameType: 'NLH',
          buyIn: 0.00,
          fee: 0.00,
          startingStack: 8000,
          startTime: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18小时后
          minPlayers: 6,
          maxPlayers: 30,
          status: 'SCHEDULED',
          tags: ['freeroll', 'beginner', 'friendly']
        }
      ]
    },
    // 大阪ポーカーハウス
    {
      clubIndex: 2,
      tournaments: [
        {
          name: '食い倒れHyper-Turbo赛',
          description: '超快速盲注结构，节奏极快，三十分钟决出胜负！适合寻求刺激的玩家。',
          gameType: 'NLH',
          buyIn: 5000.00,
          fee: 500.00,
          startingStack: 3000,
          startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3小时后
          minPlayers: 6,
          maxPlayers: 20,
          status: 'SCHEDULED',
          tags: ['hyper-turbo', 'fast', 'action']
        },
        {
          name: 'Naniwa(难波)周末主赛事',
          description: '大阪地区周末最受瞩目的赛事，拥有可观的保底奖池。',
          gameType: 'NLH',
          buyIn: 30000.00,
          fee: 3000.00,
          startingStack: 25000,
          startTime: new Date(Date.now() + 30 * 60 * 60 * 1000), // 30小时后
          minPlayers: 20,
          maxPlayers: 150,
          status: 'SCHEDULED',
          tags: ['weekend', 'main-event', 'guarantee']
        }
      ]
    },
    // 吉隆坡扑克联盟
    {
      clubIndex: 3,
      tournaments: [
        {
          name: 'KLCC月度精英赛',
          description: '每月一度的高额买入赛事，吸引本地区最顶尖的玩家参与。',
          gameType: 'NLH',
          buyIn: 1000.00,
          fee: 100.00,
          startingStack: 30000,
          startTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48小时后
          minPlayers: 15,
          maxPlayers: 100,
          status: 'SCHEDULED',
          tags: ['monthly', 'elite', 'high-roller']
        },
        {
          name: "Ladies' Event (女士专属赛)",
          description: '一场专为女性玩家设计的特别赛事，氛围友好，旨在鼓励更多女性牌手参与。',
          gameType: 'NLH',
          buyIn: 200.00,
          fee: 20.00,
          startingStack: 12000,
          startTime: new Date(Date.now() + 36 * 60 * 60 * 1000), // 36小时后
          minPlayers: 6,
          maxPlayers: 40,
          status: 'SCHEDULED',
          tags: ['ladies-only', 'special', 'inclusive']
        }
      ]
    }
  ];

  // 创建额外的锦标赛
  for (const tournamentData of additionalTournamentsData) {
    const club = clubs[tournamentData.clubIndex];
    const blindStructure = await prisma.blindStructure.findFirst({
      where: { clubId: club.id }
    });
    const payoutStructure = await prisma.payoutStructure.findFirst({
      where: { clubId: club.id }
    });
    
    for (const tournament of tournamentData.tournaments) {
      await prisma.tournament.create({
        data: {
          clubId: club.id,
          name: tournament.name,
          description: tournament.description,
          gameType: tournament.gameType,
          buyIn: tournament.buyIn,
          fee: tournament.fee,
          startingStack: tournament.startingStack,
          startTime: tournament.startTime,
          minPlayers: tournament.minPlayers,
          maxPlayers: tournament.maxPlayers,
          status: tournament.status,
          blindStructureId: blindStructure?.id,
          payoutStructureId: payoutStructure?.id,
          tags: tournament.tags
        }
      });
    }
  }

  console.log('种子数据创建完成!');
  console.log('俱乐部信息:');
  clubs.forEach((club, index) => {
    console.log(`  ${index + 1}. ${club.name} (ID: ${club.id})`);
    console.log(`     - 时区: ${club.timezone}`);
    console.log(`     - 货币: ${club.currency}`);
    console.log(`     - 描述: ${club.description}`);
  });
  
  console.log('\n测试用户:');
  console.log(`  - 管理员: ${user1.email} (密码: password123)`);
  console.log(`  - 玩家1: ${user2.email} (密码: password123)`);
  console.log(`  - 玩家2: ${user3.email} (密码: password123)`);
  console.log(`  - 荷官: ${dealerUser.email} (密码: password123)`);
  console.log(`  - 出纳: ${cashierUser.email} (密码: password123)`);
  
  console.log('\n每个俱乐部都包含:');
  console.log('  - 5个测试用户会员');
  console.log('  - 3个会员等级');
  console.log('  - 4个特色锦标赛 (包含额外特色赛事)');
  console.log('  - 4个商城兑换物品 (体现俱乐部文化特色)');
  console.log('  - 盲注结构和支付结构');
  console.log('  - 初始交易记录');
  console.log('  - 独特的AI助手角色');
  
  console.log('\n商城物品总览:');
  console.log('  上海扑克会所: 外滩特调、定制T恤、私教课程、JOPT门票');
  console.log('  台北德州俱乐部: 红柚特调、文创帆布袋、下午茶套餐、MPC门票');
  console.log('  大阪ポーカーハウス: 能量饮、棒球帽、章鱼烧券、APPT门票');
  console.log('  吉隆坡扑克联盟: 白咖啡、筹码套装、水疗券、JOPT门票');
  
  console.log('\n特色锦标赛:');
  console.log('  上海: 金融圈精英赛、专业交易员锦标赛、午间快速资格赛');
  console.log('  台北: 台北友谊赛、温馨家庭锦标赛、周末夜市派对赏金赛、新手友好练习赛');
  console.log('  大阪: 大阪礼仪杯、传统和风锦标赛、食い倒れHyper-Turbo赛、Naniwa周末主赛事');
  console.log('  吉隆坡: 国际融合赛、多元文化锦标赛、KLCC月度精英赛、Ladies Event');
  
  console.log('\n✨ Demo环境现已完全准备就绪，包含丰富的文化特色内容！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });