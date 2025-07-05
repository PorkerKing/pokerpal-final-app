#!/bin/bash

CONFIG_FILE="$HOME/.config/claude/claude_desktop_config.json"

echo "🔧 GitHub 令牌更新脚本"
echo "======================"

if [ -z "$1" ]; then
    echo "使用方法: $0 <您的GitHub令牌>"
    echo ""
    echo "例如: $0 ghp_xxxxxxxxxxxxxxxxxxxx"
    echo ""
    echo "🔑 如何获取 GitHub 令牌:"
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token (classic)'"
    echo "3. 选择以下权限:"
    echo "   - repo (完整仓库访问)"
    echo "   - read:org (读取组织)"
    echo "   - read:user (读取用户信息)"
    echo "   - user:email (用户邮箱)"
    echo "4. 生成并复制令牌"
    exit 1
fi

TOKEN="$1"

# 验证令牌格式
if [[ ! "$TOKEN" =~ ^(ghp_|github_pat_) ]]; then
    echo "⚠️  警告: 令牌格式可能不正确"
    echo "   GitHub 令牌通常以 'ghp_' 或 'github_pat_' 开头"
    read -p "是否继续? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 备份原配置
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ 已备份原配置文件"
fi

# 更新配置
cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$TOKEN"
      }
    }
  }
}
EOF

echo "✅ GitHub 令牌已更新"
echo "📝 配置文件: $CONFIG_FILE"
echo ""
echo "🔄 下一步:"
echo "1. 完全退出 Claude Desktop (Cmd+Q)"
echo "2. 重新启动 Claude Desktop"
echo "3. 测试命令: '显示我的 GitHub 仓库列表'"

# 验证配置文件
echo ""
echo "📄 新配置内容:"
echo "============="
cat "$CONFIG_FILE"