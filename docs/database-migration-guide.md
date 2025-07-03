# PokerPal vNext 数据库迁移指南

## 概述
这是 PokerPal vNext 版本的完整数据库迁移指南。新的数据库结构支持所有全功能扑克俱乐部管理平台的需求。

## 生产环境部署步骤

### 1. 在 Supabase 中执行 SQL 脚本

请在 Supabase Dashboard > SQL Editor 中执行以下完整的迁移脚本：

```sql
-- PokerPal vNext Database Migration Script
-- 创建所有枚举类型
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'DEALER', 'CASHIER', 'VIP', 'GUEST');
CREATE TYPE "TournamentStatus" AS ENUM ('SCHEDULED', 'REGISTERING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PAUSED');
CREATE TYPE "GameType" AS ENUM ('NLH', 'PLO', 'PLO5', 'MIXED', 'OTHER');
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TOURNAMENT_BUYIN', 'TOURNAMENT_CASHOUT', 'CASH_GAME_BUYIN', 'CASH_GAME_CASHOUT', 'STORE_PURCHASE', 'OPERATIONAL_EXPENSE', 'TRANSFER', 'BONUS', 'ADJUSTMENT', 'RAKE_COLLECTED');
CREATE TYPE "NotificationType" AS ENUM ('TOURNAMENT_STARTING', 'TOURNAMENT_REGISTERED', 'ACHIEVEMENT_UNLOCKED', 'PROMOTION', 'SYSTEM', 'CLUB_UPDATE', 'BALANCE_UPDATE');
CREATE TYPE "TableStatus" AS ENUM ('WAITING', 'ACTIVE', 'PAUSED', 'CLOSED');
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING');

-- 创建核心表结构
-- Club 表 - 俱乐部信息
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- User 表 - 用户信息
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'zh',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- ClubMember 表 - 俱乐部成员关系
CREATE TABLE "ClubMember" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalBuyIn" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCashOut" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "vipLevel" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("id")
);

-- AI & Chat 相关表
CREATE TABLE "AIPersona" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "systemPrompt" TEXT,
    "avatarUrl" TEXT,
    "voiceId" TEXT,
    "capabilities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AIPersona_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "aiPersonaId" TEXT,
    "clubId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- 认证相关表 (NextAuth.js)
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
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
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- 锦标赛相关表
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gameType" "GameType" NOT NULL DEFAULT 'NLH',
    "buyIn" DECIMAL(10,2) NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "rebuyAmount" DECIMAL(10,2),
    "addonAmount" DECIMAL(10,2),
    "startingStack" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "lateRegEndTime" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "minPlayers" INTEGER NOT NULL DEFAULT 2,
    "maxPlayers" INTEGER,
    "status" "TournamentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "blindStructureId" TEXT NOT NULL,
    "payoutStructureId" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TournamentPlayer" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registrationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seatNumber" INTEGER,
    "tableNumber" INTEGER,
    "chipCount" INTEGER NOT NULL DEFAULT 0,
    "rebuys" INTEGER NOT NULL DEFAULT 0,
    "addons" INTEGER NOT NULL DEFAULT 0,
    "finalRank" INTEGER,
    "winnings" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "bustOutTime" TIMESTAMP(3),
    CONSTRAINT "TournamentPlayer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlindStructure" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "levels" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlindStructure_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayoutStructure" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "payouts" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PayoutStructure_pkey" PRIMARY KEY ("id")
);

-- 现金局相关表
CREATE TABLE "RingGameTable" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL DEFAULT 'NLH',
    "stakes" TEXT NOT NULL,
    "smallBlind" DECIMAL(10,2) NOT NULL,
    "bigBlind" DECIMAL(10,2) NOT NULL,
    "minBuyIn" DECIMAL(10,2) NOT NULL,
    "maxBuyIn" DECIMAL(10,2) NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 9,
    "status" "TableStatus" NOT NULL DEFAULT 'WAITING',
    "serviceFeeStructureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RingGameTable_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashGameSession" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seatNumber" INTEGER,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "buyInAmount" DECIMAL(10,2) NOT NULL,
    "cashOutAmount" DECIMAL(10,2),
    "peakStack" DECIMAL(10,2),
    "handsPlayed" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CashGameSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceFeeStructure" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "percentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServiceFeeStructure_pkey" PRIMARY KEY ("id")
);

-- 财务和交易相关表
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceBefore" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalExpense" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "receiptUrl" TEXT,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperationalExpense_pkey" PRIMARY KEY ("id")
);

-- 游戏化功能相关表
CREATE TABLE "MembershipTier" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "minPointsRequired" INTEGER NOT NULL DEFAULT 0,
    "minGamesRequired" INTEGER NOT NULL DEFAULT 0,
    "benefits" JSONB NOT NULL,
    "badgeUrl" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MembershipTier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "minGames" INTEGER NOT NULL DEFAULT 0,
    "prizes" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "leaderboardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "iconUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "criteria" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- 俱乐部商店相关表
CREATE TABLE "StoreItem" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "pointsCost" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StoreItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserStorePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "pointsUsed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "shippingAddress" JSONB,
    "notes" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDate" TIMESTAMP(3),
    CONSTRAINT "UserStorePurchase_pkey" PRIMARY KEY ("id")
);

-- 通信相关表
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publishAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "percentage" DOUBLE PRECISION,
    "conditions" JSONB NOT NULL,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- 负责任游戏设置
CREATE TABLE "ResponsibleGamingSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "depositLimit" DECIMAL(10,2),
    "depositLimitPeriod" TEXT,
    "lossLimit" DECIMAL(10,2),
    "lossLimitPeriod" TEXT,
    "sessionTimeLimit" INTEGER,
    "coolingOffUntil" TIMESTAMP(3),
    "selfExclusionUntil" TIMESTAMP(3),
    "realityCheckInterval" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResponsibleGamingSettings_pkey" PRIMARY KEY ("id")
);

-- 创建唯一约束
CREATE UNIQUE INDEX "Club_name_key" ON "Club"("name");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "ClubMember_clubId_userId_key" ON "ClubMember"("clubId", "userId");
CREATE UNIQUE INDEX "AIPersona_clubId_key" ON "AIPersona"("clubId");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "TournamentPlayer_tournamentId_userId_key" ON "TournamentPlayer"("tournamentId", "userId");
CREATE UNIQUE INDEX "MembershipTier_clubId_level_key" ON "MembershipTier"("clubId", "level");
CREATE UNIQUE INDEX "LeaderboardEntry_leaderboardId_userId_key" ON "LeaderboardEntry"("leaderboardId", "userId");
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
CREATE UNIQUE INDEX "ResponsibleGamingSettings_userId_key" ON "ResponsibleGamingSettings"("userId");

-- 创建索引以优化查询性能
CREATE INDEX "Club_isActive_idx" ON "Club"("isActive");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
CREATE INDEX "ClubMember_clubId_status_idx" ON "ClubMember"("clubId", "status");
CREATE INDEX "ClubMember_userId_idx" ON "ClubMember"("userId");
CREATE INDEX "ChatMessage_userId_createdAt_idx" ON "ChatMessage"("userId", "createdAt");
CREATE INDEX "ChatMessage_clubId_createdAt_idx" ON "ChatMessage"("clubId", "createdAt");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Tournament_clubId_status_idx" ON "Tournament"("clubId", "status");
CREATE INDEX "Tournament_startTime_idx" ON "Tournament"("startTime");
CREATE INDEX "TournamentPlayer_tournamentId_isActive_idx" ON "TournamentPlayer"("tournamentId", "isActive");
CREATE INDEX "TournamentPlayer_userId_idx" ON "TournamentPlayer"("userId");
CREATE INDEX "BlindStructure_clubId_idx" ON "BlindStructure"("clubId");
CREATE INDEX "PayoutStructure_clubId_idx" ON "PayoutStructure"("clubId");
CREATE INDEX "RingGameTable_clubId_status_idx" ON "RingGameTable"("clubId", "status");
CREATE INDEX "CashGameSession_tableId_startTime_idx" ON "CashGameSession"("tableId", "startTime");
CREATE INDEX "CashGameSession_userId_startTime_idx" ON "CashGameSession"("userId", "startTime");
CREATE INDEX "ServiceFeeStructure_clubId_idx" ON "ServiceFeeStructure"("clubId");
CREATE INDEX "Transaction_userId_timestamp_idx" ON "Transaction"("userId", "timestamp");
CREATE INDEX "Transaction_clubId_timestamp_idx" ON "Transaction"("clubId", "timestamp");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "OperationalExpense_clubId_date_idx" ON "OperationalExpense"("clubId", "date");
CREATE INDEX "MembershipTier_clubId_isActive_idx" ON "MembershipTier"("clubId", "isActive");
CREATE INDEX "Leaderboard_clubId_isActive_idx" ON "Leaderboard"("clubId", "isActive");
CREATE INDEX "Leaderboard_startDate_endDate_idx" ON "Leaderboard"("startDate", "endDate");
CREATE INDEX "LeaderboardEntry_leaderboardId_rank_idx" ON "LeaderboardEntry"("leaderboardId", "rank");
CREATE INDEX "Achievement_clubId_isActive_idx" ON "Achievement"("clubId", "isActive");
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");
CREATE INDEX "StoreItem_clubId_isActive_idx" ON "StoreItem"("clubId", "isActive");
CREATE INDEX "UserStorePurchase_userId_idx" ON "UserStorePurchase"("userId");
CREATE INDEX "UserStorePurchase_status_idx" ON "UserStorePurchase"("status");
CREATE INDEX "Announcement_clubId_isActive_idx" ON "Announcement"("clubId", "isActive");
CREATE INDEX "Announcement_publishAt_expiresAt_idx" ON "Announcement"("publishAt", "expiresAt");
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX "Promotion_clubId_isActive_idx" ON "Promotion"("clubId", "isActive");
CREATE INDEX "Promotion_startDate_endDate_idx" ON "Promotion"("startDate", "endDate");

-- 添加外键约束
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIPersona" ADD CONSTRAINT "AIPersona_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_aiPersonaId_fkey" FOREIGN KEY ("aiPersonaId") REFERENCES "AIPersona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_blindStructureId_fkey" FOREIGN KEY ("blindStructureId") REFERENCES "BlindStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_payoutStructureId_fkey" FOREIGN KEY ("payoutStructureId") REFERENCES "PayoutStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TournamentPlayer" ADD CONSTRAINT "TournamentPlayer_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TournamentPlayer" ADD CONSTRAINT "TournamentPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlindStructure" ADD CONSTRAINT "BlindStructure_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PayoutStructure" ADD CONSTRAINT "PayoutStructure_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RingGameTable" ADD CONSTRAINT "RingGameTable_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RingGameTable" ADD CONSTRAINT "RingGameTable_serviceFeeStructureId_fkey" FOREIGN KEY ("serviceFeeStructureId") REFERENCES "ServiceFeeStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashGameSession" ADD CONSTRAINT "CashGameSession_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RingGameTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CashGameSession" ADD CONSTRAINT "CashGameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceFeeStructure" ADD CONSTRAINT "ServiceFeeStructure_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalExpense" ADD CONSTRAINT "OperationalExpense_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MembershipTier" ADD CONSTRAINT "MembershipTier_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreItem" ADD CONSTRAINT "StoreItem_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserStorePurchase" ADD CONSTRAINT "UserStorePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserStorePurchase" ADD CONSTRAINT "UserStorePurchase_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StoreItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResponsibleGamingSettings" ADD CONSTRAINT "ResponsibleGamingSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 2. 验证迁移

执行完脚本后，验证所有表是否创建成功：

```sql
-- 验证表创建
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 验证枚举类型
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'Role'::regtype;
```

### 3. 生成 Prisma 客户端

在项目中运行：

```bash
npm run prisma:generate
```

### 4. 环境变量配置

确保 `.env` 文件包含正确的数据库连接信息：

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
```

## 数据库结构说明

### 核心功能模块

1. **俱乐部管理** - Club, ClubMember
2. **用户认证** - User, Account, Session
3. **AI 聊天** - AIPersona, ChatMessage
4. **锦标赛系统** - Tournament, TournamentPlayer, BlindStructure, PayoutStructure
5. **现金局管理** - RingGameTable, CashGameSession, ServiceFeeStructure
6. **财务系统** - Transaction, OperationalExpense
7. **游戏化** - MembershipTier, Leaderboard, Achievement
8. **商店系统** - StoreItem, UserStorePurchase
9. **通信系统** - Announcement, Notification, Promotion
10. **负责任游戏** - ResponsibleGamingSettings

### 新增特性

- **增强的会员管理** - 支持 VIP 等级、会员状态等
- **完整的游戏化系统** - 排行榜、成就、会员等级
- **通信系统** - 公告、通知、促销活动
- **AI 聊天历史记录** - 完整的对话存储
- **负责任游戏功能** - 限额设置、自我排除等

## 下一步

数据库迁移完成后，继续进行 API 层和前端的开发工作。