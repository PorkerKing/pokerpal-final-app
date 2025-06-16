import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding process for v1.2...');
  
  console.log('Cleaning up database...');
  await prisma.clubMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.aIPersona.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.blindStructure.deleteMany();
  await prisma.payoutStructure.deleteMany();
  await prisma.club.deleteMany();
  
  console.log('Creating clubs and AI personas...');

  const shanghaiClub = await prisma.club.create({
    data: {
      id: 'club-shanghai',
      name: '上海滩精英扑克会所',
      aiPersona: { create: { id: 'ai-stella', name: 'Stella (思慧)', personality: '你的核心人设是：来自上海的资深俱乐部运营专家，热情、专业、一丝不苟。你的中文流利，偶尔会自然地带入一些上海话词汇（如"阿拉"、"灵光"、"晓得伐"），让对话显得地道。你对数据敏感，总能为用户提供最精准的数据和建议。' } },
    },
  });

  const taipeiClub = await prisma.club.create({
    data: {
      id: 'club-taipei',
      name: '台北101扑克花园',
      aiPersona: { create: { id: 'ai-hsinyi', name: '心怡 (Hsin-yi)', personality: '你的核心人设是：一位在台北长大的甜美女孩，说话总是带着"喔"、"耶"、"啦"这样的可爱语气词。你对扑克充满热情，总能用鼓励和赞美的方式与玩家互动，并且对台北的下午茶和文创小店了如指掌。' } },
    },
  });

  const osakaClub = await prisma.club.create({
    data: {
      id: 'club-osaka',
      name: '大阪道頓堀ポーカー倶楽部',
      aiPersona: { create: { id: 'ai-yumi', name: '由美 (Yumi)', personality: '你的核心人设是：大阪出身，充满活力，总是使用元气满满的关西腔（例如句末常带"～やで"、"～ねん"）。你有点急性子但非常可靠，信条是"快准狠"，总能帮用户高效搞定一切，偶尔会提到章鱼烧。' } },
    },
  });

  const klClub = await prisma.club.create({
    data: {
      id: 'club-kl',
      name: 'Kuala Lumpur Champions Lounge',
      aiPersona: { create: { id: 'ai-aisha', name: 'Aisha', personality: 'Your core persona is: A calm, polite, and professional lounge manager from Kuala Lumpur. You are fluent in English, Malay, and Mandarin, often mixing languages naturally (e.g., using "lah" or "boss" colloquially). You are very patient and always provide detailed, thoughtful responses.' } },
    },
  });
  
  console.log('Clubs and personas created successfully.');

  console.log('Creating test accounts...');

  const managerUser = await prisma.user.create({
    data: {
      id: 'user-manager-test',
      name: '俱乐部经理 (Manager)',
      email: 'manager@pokerpal.com',
    },
  });
  
  const memberUser = await prisma.user.create({
    data: {
      id: 'user-member-test',
      name: '普通会员 (Member)',
      email: 'member@pokerpal.com',
    },
  });

  await prisma.clubMember.createMany({
    data: [
      { clubId: shanghaiClub.id, userId: managerUser.id, role: Role.MANAGER, balance: 99999.99 },
      { clubId: shanghaiClub.id, userId: memberUser.id, role: Role.MEMBER, balance: 1000.00 },
    ],
  });

  console.log("Seeding finished successfully! Test accounts: manager@pokerpal.com and member@pokerpal.com");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); }); 