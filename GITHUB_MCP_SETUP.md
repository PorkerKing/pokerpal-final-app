# GitHub MCP 服务器设置指南

## 🚀 已完成的设置

✅ 安装了 GitHub MCP 服务器  
✅ 创建了 Claude Desktop 配置文件  
✅ 配置了基本的 MCP 服务器设置  

## 🔑 需要您完成的步骤

### 1. 创建 GitHub 个人访问令牌 (PAT)

1. **访问 GitHub 设置**
   - 登录 GitHub
   - 点击右上角头像 → Settings
   - 左侧菜单中点击 "Developer settings"
   - 点击 "Personal access tokens" → "Tokens (classic)"

2. **生成新令牌**
   - 点击 "Generate new token" → "Generate new token (classic)"
   - **Note**: 输入 "Claude MCP GitHub Integration"
   - **Expiration**: 选择适当的过期时间（建议 90 天或更长）

3. **选择权限范围 (Scopes)**
   
   **必需权限：**
   - ✅ `repo` - 完整的仓库访问权限
   - ✅ `read:org` - 读取组织信息
   - ✅ `read:user` - 读取用户信息
   - ✅ `user:email` - 访问用户邮箱信息

   **可选权限（增强功能）：**
   - ✅ `write:discussion` - 管理讨论
   - ✅ `read:project` - 读取项目信息

4. **生成并复制令牌**
   - 点击 "Generate token"
   - **重要**: 立即复制生成的令牌（离开页面后无法再次查看）

### 2. 配置 Claude Desktop

1. **打开配置文件**
   ```bash
   open ~/.config/claude/claude_desktop_config.json
   ```

2. **添加您的 GitHub 令牌**
   将以下内容中的 `YOUR_GITHUB_TOKEN_HERE` 替换为您的实际令牌：
   
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "mcp-server-github",
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN_HERE"
         }
       }
     }
   }
   ```

### 3. 重启 Claude Desktop

1. **完全退出 Claude Desktop**
   - macOS: `Cmd + Q`
   - Windows: 关闭应用程序

2. **重新启动 Claude Desktop**
   - 重新打开应用程序
   - 等待 MCP 服务器连接

## 🎯 功能预览

配置完成后，您将能够：

- 📊 **查看仓库信息** - 直接获取仓库统计、分支、提交历史
- 🔍 **搜索代码** - 在仓库中搜索特定代码或文件
- 📋 **管理 Issues** - 创建、查看、更新 GitHub Issues
- 🔄 **管理 Pull Requests** - 查看和管理 PR 状态
- 📈 **查看贡献统计** - 获取详细的仓库活动信息
- 🏷️ **管理标签和里程碑** - 组织项目管理

## 🔒 安全提示

- 🔐 妥善保管您的 GitHub 令牌
- 🕒 定期更新令牌以保证安全
- ⚠️ 不要在公共场所分享配置文件
- 🛡️ 建议为 MCP 使用单独的令牌

## 🆘 故障排除

如果遇到问题：

1. **检查令牌权限** - 确保勾选了必需的权限范围
2. **验证配置文件** - 确保 JSON 格式正确
3. **重启应用** - 完全重启 Claude Desktop
4. **查看日志** - 检查 Claude Desktop 的错误日志

## 📞 需要帮助？

配置完成后，您可以在 Claude 中使用以下命令测试：
- "显示我的 GitHub 仓库列表"
- "查看 pokerpal-final-app 仓库的最新提交"
- "帮我创建一个新的 Issue"

---

**配置位置**: `~/.config/claude/claude_desktop_config.json`  
**安装时间**: $(date)  