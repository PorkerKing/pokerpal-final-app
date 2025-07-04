# PokerPal 部署检查清单

## 准备工作 ✅
- [x] 项目代码已完成
- [x] Vercel配置文件已创建 (`vercel.json`)
- [x] 数据库schema已定义 (`prisma/schema.prisma`)
- [x] 环境变量模板已准备 (`.env`)

## 第一步：Supabase 数据库设置

### 1.1 创建/验证 Supabase 项目
- [ ] 访问 [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] 确认项目 `pkjkbvvpthneaciyxskv` 存在且活跃
- [ ] 记录项目URL和区域 (当前: `aws-0-ap-northeast-1`)

### 1.2 执行数据库初始化
- [ ] 在 Supabase 项目中，进入 **SQL Editor**
- [ ] 复制并执行 `SUPABASE_SETUP.md` 文件中的所有SQL代码：
  - [ ] 创建表结构 (User, Account, Session, VerificationToken, GameRoom, GameHistory)
  - [ ] 创建索引
  - [ ] 添加外键约束
  - [ ] 插入种子数据 (游戏房间)
  - [ ] 启用 Row Level Security (RLS)
  - [ ] 创建安全策略

### 1.3 验证数据库设置
- [ ] 在 **Table Editor** 中确认所有表已创建
- [ ] 验证种子数据已插入 (应该有6个游戏房间)
- [ ] 检查 **Authentication → Settings** 是否启用邮件认证

## 第二步：GitHub OAuth 设置

### 2.1 更新 GitHub OAuth 应用
- [ ] 访问 [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
- [ ] 找到应用 ID: `Ov23liI8733GWbuMB84z`
- [ ] 更新以下设置：
  - [ ] Homepage URL: `https://your-app-name.vercel.app` (替换为实际域名)
  - [ ] Authorization callback URL: `https://your-app-name.vercel.app/api/auth/callback/github`

## 第三步：Vercel 部署设置

### 3.1 推送代码到 GitHub
```bash
# 确保所有更改已提交
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 3.2 创建 Vercel 项目
- [ ] 访问 [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] 点击 **"Add New..." → "Project"**
- [ ] 导入 GitHub 仓库
- [ ] 选择 **Next.js** 框架预设

### 3.3 配置 Vercel 环境变量
在 Vercel 项目设置中添加以下环境变量：

```env
DATABASE_URL=postgresql://postgres.pkjkbvvpthneaciyxskv:Githubisgood1~@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

NEXTAUTH_URL=https://your-app-name.vercel.app

NEXTAUTH_SECRET=oFr3UhXqYaraqlupxnB7CiRJkQeV5N+gUvndA7S2Zac=

GITHUB_CLIENT_ID=Ov23liI8733GWbuMB84z

GITHUB_CLIENT_SECRET=43ab5b33fd88aa113a848f070f235310a5e1645c

SILICONFLOW_API_KEY=sk-qrepdoeulgmgvnfylvgpxcmmrrqihvgiojehzgzggmqfoshs
```

**重要提醒：**
- [ ] 将 `your-app-name.vercel.app` 替换为实际的 Vercel 域名
- [ ] 确保 `DATABASE_URL` 使用 pooler 连接 (端口 6543)

### 3.4 部署项目
- [ ] 点击 **"Deploy"** 开始部署
- [ ] 等待构建完成 (大约 2-3 分钟)
- [ ] 记录分配的域名 (格式: `project-name-xxx.vercel.app`)

## 第四步：部署后验证

### 4.1 功能测试
- [ ] 访问部署的网站
- [ ] 测试 GitHub 登录功能
- [ ] 验证多语言切换 (中文/英文)
- [ ] 检查游戏房间列表是否显示
- [ ] 测试 AI 聊天功能

### 4.2 错误检查
- [ ] 查看 Vercel Function 日志确认无错误
- [ ] 检查浏览器控制台无 JavaScript 错误
- [ ] 验证数据库连接正常

## 第五步：生产环境优化 (可选)

### 5.1 域名配置
- [ ] 在 Vercel 中添加自定义域名
- [ ] 配置 DNS 记录
- [ ] 更新 GitHub OAuth 回调 URL

### 5.2 监控设置
- [ ] 启用 Vercel Analytics
- [ ] 配置错误监控
- [ ] 设置性能监控

## 故障排除

### 常见问题及解决方案：

**部署失败：**
- 检查构建日志中的具体错误
- 确认所有环境变量已正确设置
- 验证 Prisma schema 语法正确

**登录失败：**
- 确认 GitHub OAuth 回调 URL 正确
- 检查 `NEXTAUTH_URL` 与实际域名匹配
- 验证 `NEXTAUTH_SECRET` 已设置

**数据库连接错误：**
- 确认使用 pooler 连接 (端口 6543)
- 检查 Supabase 项目状态
- 验证密码中的特殊字符已正确编码

**AI 功能不工作：**
- 验证 SiliconFlow API 密钥有效
- 检查 API 配额状态

## 完成确认

- [ ] 网站可以正常访问
- [ ] 用户可以注册/登录
- [ ] 所有主要功能正常工作
- [ ] 无控制台错误
- [ ] 性能表现良好

---

**注意：** 部署完成后，请将实际的 Vercel 域名更新到相关配置中，并测试所有功能确保正常运行。