# PokerPal 部署指南

## Vercel 部署前的手动设置

### 1. Supabase 数据库设置

1. **创建 Supabase 项目**
   - 访问 [Supabase](https://supabase.com)
   - 创建新项目（选择新加坡或离您最近的区域）
   - 等待项目初始化完成

2. **获取数据库连接字符串**
   - 在 Supabase 项目中，进入 Settings → Database
   - 找到 "Connection Pooling" 部分
   - 复制 "Connection string" （注意：必须使用 pooler 连接，端口通常是 6543）
   - 格式应该类似：`postgresql://postgres.[项目ID]:[密码]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`

3. **初始化数据库**
   - 在本地运行以下命令：
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### 2. GitHub OAuth 应用设置

1. 访问 GitHub Settings → Developer settings → OAuth Apps
2. 点击 "New OAuth App"
3. 填写以下信息：
   - Application name: PokerPal
   - Homepage URL: `https://your-app.vercel.app`
   - Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`
4. 创建后保存 Client ID 和 Client Secret

### 3. Vercel 环境变量设置

在 Vercel 项目设置中添加以下环境变量：

```env
# 数据库
DATABASE_URL="你的Supabase连接字符串"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="使用 openssl rand -base64 32 生成"

# GitHub OAuth
GITHUB_CLIENT_ID="你的GitHub Client ID"
GITHUB_CLIENT_SECRET="你的GitHub Client Secret"

# 邮件服务（可选，用于邮件登录）
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="PokerPal <noreply@your-domain.com>"

# AI 服务
SILICONFLOW_API_KEY="你的SiliconFlow API密钥"
```

### 4. 部署步骤

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **在 Vercel 导入项目**
   - 访问 [Vercel](https://vercel.com)
   - 点击 "Import Project"
   - 选择你的 GitHub 仓库
   - 确保选择 Next.js 框架
   - 添加上述所有环境变量

3. **部署后验证**
   - 检查构建日志确保没有错误
   - 访问部署的 URL
   - 测试登录功能
   - 检查数据库连接是否正常

### 5. 常见问题

**Q: 部署后出现 "Application error"**
- 检查 Vercel 函数日志
- 确认所有环境变量都已正确设置
- 确保数据库连接字符串使用的是 pooler 连接

**Q: GitHub 登录失败**
- 确认 OAuth 回调 URL 与 NEXTAUTH_URL 匹配
- 检查 GitHub OAuth 应用设置

**Q: 数据库连接失败**
- 确认使用的是 Connection Pooling URL（端口 6543）
- 检查 Supabase 项目是否处于活跃状态

**Q: AI 功能不工作**
- 验证 SiliconFlow API 密钥是否有效
- 检查 API 配额是否充足

### 6. 生产环境优化建议

1. **启用 Vercel Analytics**（可选）
2. **配置自定义域名**
3. **设置环境变量的生产/预览/开发分离**
4. **启用 Edge Runtime 以提高性能**
5. **配置 CORS 如果需要 API 访问**

需要更多帮助？查看 [Vercel 文档](https://vercel.com/docs) 或 [Next.js 部署指南](https://nextjs.org/docs/deployment)。