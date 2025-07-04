# Supabase 数据库设置指南

## 重要说明

Supabase 使用两种不同的连接URL：

1. **直接连接 (端口 5432)** - 用于数据库迁移和管理
   - 格式: `postgresql://postgres.[项目ID]:[密码]@aws-0-ap-northeast-1.data.supabase.com:5432/postgres`
   - 用途: Prisma迁移、数据库架构推送

2. **连接池 (端口 6543)** - 用于应用程序连接
   - 格式: `postgresql://postgres.[项目ID]:[密码]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`
   - 用途: 生产环境应用程序连接

## 手动设置步骤

由于网络连接问题，你可能需要在 Supabase 控制面板中手动执行以下操作：

### 1. 通过 Supabase SQL 编辑器创建表

访问你的 Supabase 项目 → SQL Editor，然后执行以下 SQL：

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "coins" INTEGER NOT NULL DEFAULT 1000,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "statistics" JSONB NOT NULL DEFAULT '{"gamesPlayed":0,"handsWon":0,"biggestPot":0,"winRate":0}',
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "purchasedItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentAvatarFrame" TEXT,
    "currentCardBack" TEXT DEFAULT 'default',
    "settings" JSONB NOT NULL DEFAULT '{"sound":true,"notifications":true,"autoMuck":false,"fourColorDeck":false,"showHandStrength":true}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 创建账户表（用于OAuth）
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId")
);

-- 创建会话表
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Session_sessionToken_key" UNIQUE ("sessionToken")
);

-- 创建验证令牌表
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_token_key" UNIQUE ("token"),
    CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
);

-- 创建游戏房间表
CREATE TABLE IF NOT EXISTS "GameRoom" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 6,
    "smallBlind" INTEGER NOT NULL,
    "bigBlind" INTEGER NOT NULL,
    "currentPlayers" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRoom_pkey" PRIMARY KEY ("id")
);

-- 创建游戏历史表
CREATE TABLE IF NOT EXISTS "GameHistory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "roomId" TEXT NOT NULL,
    "players" JSONB NOT NULL,
    "winner" TEXT NOT NULL,
    "potSize" INTEGER NOT NULL,
    "handDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameHistory_pkey" PRIMARY KEY ("id")
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "GameHistory_roomId_idx" ON "GameHistory"("roomId");
CREATE INDEX IF NOT EXISTS "GameHistory_winner_idx" ON "GameHistory"("winner");

-- 添加外键约束
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_roomId_fkey" 
    FOREIGN KEY ("roomId") REFERENCES "GameRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 2. 插入种子数据

继续在 SQL 编辑器中执行：

```sql
-- 插入示例游戏房间
INSERT INTO "GameRoom" ("name", "maxPlayers", "smallBlind", "bigBlind", "status") VALUES
('新手房 1', 6, 10, 20, 'waiting'),
('新手房 2', 6, 10, 20, 'waiting'),
('进阶房 1', 6, 50, 100, 'waiting'),
('进阶房 2', 6, 50, 100, 'waiting'),
('高手房', 6, 100, 200, 'waiting'),
('VIP房', 4, 500, 1000, 'waiting');
```

### 3. 启用 Row Level Security (RLS)

```sql
-- 启用 RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GameRoom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GameHistory" ENABLE ROW LEVEL SECURITY;

-- 创建策略（允许通过应用程序访问）
CREATE POLICY "Allow all operations for authenticated users" ON "User"
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON "Account"
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON "Session"
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON "GameRoom"
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON "GameHistory"
    FOR ALL USING (true);
```

### 4. 验证设置

在 Supabase 控制面板中：
1. 进入 Table Editor，确认所有表都已创建
2. 检查 Authentication → Settings，确保启用了邮件认证
3. 在 Settings → API 中找到你的项目 URL 和 anon key（如果需要）

### 5. 更新环境变量

确保你的 `.env` 文件使用正确的连接池 URL（端口 6543）：

```env
DATABASE_URL="postgresql://postgres.pkjkbvvpthneaciyxskv:Githubisgood1~@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
```

## 故障排除

如果遇到连接问题：

1. **检查项目状态**：确保 Supabase 项目处于活跃状态（免费层项目会在不活动后暂停）
2. **重置密码**：如果密码包含特殊字符，考虑在 Supabase 中重置为更简单的密码
3. **检查区域**：确保选择了正确的区域（aws-0-ap-northeast-1）
4. **使用连接池**：生产环境必须使用连接池 URL（端口 6543）