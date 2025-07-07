# Supabase 数据库设置指南

## 数据库连接问题分析

在尝试设置测试账号时，遇到了数据库连接问题：
1. Prisma 模式与数据库不同步
2. 缺少某些列（如 `preferredLanguage`）
3. 连接池问题导致 "prepared statement already exists" 错误

## 推荐解决方案

### 方法 1: 使用 Supabase Dashboard 手动创建

1. **登录 Supabase Dashboard**
   - 访问 https://supabase.com/dashboard
   - 登录到项目 `pkjkbvvpthneaciyxskv`

2. **检查和更新数据库模式**
   ```sql
   -- 检查当前 User 表结构
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'User' 
   ORDER BY ordinal_position;
   
   -- 如果缺少 preferredLanguage 列，添加它
   ALTER TABLE "User" ADD COLUMN "preferredLanguage" TEXT DEFAULT 'zh';
   
   -- 检查 Role 枚举
   SELECT enumlabel FROM pg_enum 
   JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
   WHERE pg_type.typname = 'Role' 
   ORDER BY enumsortorder;
   
   -- 如果需要更新 Role 枚举 (添加 RECEPTIONIST)
   ALTER TYPE "Role" ADD VALUE 'RECEPTIONIST';
   ```

3. **创建测试用户**
   ```sql
   -- 设置密码哈希 (password123)
   -- 使用 bcryptjs 在线工具生成，或运行: node -e "console.log(require('bcryptjs').hashSync('password123', 12))"
   
   INSERT INTO "User" (email, name, password, "preferredLanguage") VALUES
   ('owner@pokerpal.com', '俱乐部所有者', '$2a$12$hash_here', 'zh'),
   ('admin@pokerpal.com', '管理员', '$2a$12$hash_here', 'zh'),
   ('manager@pokerpal.com', '运营经理', '$2a$12$hash_here', 'zh'),
   ('member1@pokerpal.com', '会员张三', '$2a$12$hash_here', 'zh'),
   ('member2@pokerpal.com', '会员李四', '$2a$12$hash_here', 'zh'),
   ('dealer@pokerpal.com', '荷官小王', '$2a$12$hash_here', 'zh'),
   ('receptionist@pokerpal.com', '前台小李', '$2a$12$hash_here', 'zh'),
   ('vip@pokerpal.com', 'VIP会员', '$2a$12$hash_here', 'zh')
   ON CONFLICT (email) DO NOTHING;
   ```

4. **为用户分配俱乐部角色**
   ```sql
   -- 首先获取俱乐部 ID 和用户 ID
   SELECT id, name FROM "Club";
   SELECT id, email FROM "User";
   
   -- 为第一个俱乐部分配用户角色
   INSERT INTO "ClubMember" ("clubId", "userId", role, status, balance, "totalBuyIn", "totalCashOut", "vipLevel") 
   SELECT 
     (SELECT id FROM "Club" LIMIT 1),
     u.id,
     CASE 
       WHEN u.email = 'owner@pokerpal.com' THEN 'OWNER'::\"Role\"
       WHEN u.email = 'admin@pokerpal.com' THEN 'ADMIN'::\"Role\"
       WHEN u.email = 'manager@pokerpal.com' THEN 'MANAGER'::\"Role\"
       WHEN u.email LIKE 'member%@pokerpal.com' THEN 'MEMBER'::\"Role\"
       WHEN u.email = 'dealer@pokerpal.com' THEN 'DEALER'::\"Role\"
       WHEN u.email = 'receptionist@pokerpal.com' THEN 'RECEPTIONIST'::\"Role\"
       WHEN u.email = 'vip@pokerpal.com' THEN 'VIP'::\"Role\"
     END as role,
     'ACTIVE' as status,
     CASE 
       WHEN u.email = 'owner@pokerpal.com' THEN 50000.00
       WHEN u.email = 'admin@pokerpal.com' THEN 20000.00
       WHEN u.email = 'manager@pokerpal.com' THEN 10000.00
       WHEN u.email = 'vip@pokerpal.com' THEN 15000.00
       ELSE 5000.00
     END as balance,
     0.00 as "totalBuyIn",
     0.00 as "totalCashOut",
     CASE 
       WHEN u.email IN ('owner@pokerpal.com', 'admin@pokerpal.com', 'vip@pokerpal.com') THEN 3
       ELSE 1
     END as "vipLevel"
   FROM "User" u
   WHERE u.email IN (
     'owner@pokerpal.com', 'admin@pokerpal.com', 'manager@pokerpal.com',
     'member1@pokerpal.com', 'member2@pokerpal.com', 'dealer@pokerpal.com',
     'receptionist@pokerpal.com', 'vip@pokerpal.com'
   )
   ON CONFLICT ("clubId", "userId") DO NOTHING;
   ```

### 方法 2: 修复本地环境并重新运行种子

1. **更新环境变量**
   ```bash
   # 临时使用直接连接 URL
   export DATABASE_URL="postgresql://postgres:Githubisgood1@db.pkjkbvvpthneaciyxskv.supabase.co:5432/postgres"
   ```

2. **重置并重新迁移**
   ```bash
   npx prisma migrate reset --force
   npx prisma db push
   npx prisma generate
   npm run seed
   ```

### 方法 3: 使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install supabase -g

# 登录并链接项目
supabase login
supabase link --project-ref pkjkbvvpthneaciyxskv

# 查看数据库状态
supabase db diff

# 应用本地模式到远程
supabase db push
```

## 验证设置

完成设置后，验证测试账号：

```sql
-- 检查所有测试用户
SELECT u.email, u.name, cm.role, c.name as club_name 
FROM "User" u
LEFT JOIN "ClubMember" cm ON u.id = cm."userId"
LEFT JOIN "Club" c ON cm."clubId" = c.id
WHERE u.email LIKE '%@pokerpal.com'
ORDER BY u.email;

-- 检查角色分布
SELECT role, COUNT(*) as count 
FROM "ClubMember" 
GROUP BY role 
ORDER BY role;
```

## 测试账号清单

| 角色 | 邮箱 | 姓名 | 权限级别 |
|------|------|------|----------|
| OWNER | owner@pokerpal.com | 俱乐部所有者 | 最高权限 |
| ADMIN | admin@pokerpal.com | 管理员 | 管理权限 |
| MANAGER | manager@pokerpal.com | 运营经理 | 管理权限 |
| MEMBER | member1@pokerpal.com | 会员张三 | 基础权限 |
| MEMBER | member2@pokerpal.com | 会员李四 | 基础权限 |
| DEALER | dealer@pokerpal.com | 荷官小王 | DL权限 |
| RECEPTIONIST | receptionist@pokerpal.com | 前台小李 | 前台权限 |
| VIP | vip@pokerpal.com | VIP会员 | VIP权限 |

所有账号密码: `password123`