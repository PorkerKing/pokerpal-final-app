#!/bin/bash

echo "🔍 GitHub MCP 设置验证脚本"
echo "=============================="

# 检查 MCP 服务器安装
echo "1. 检查 GitHub MCP 服务器安装..."
if command -v mcp-server-github &> /dev/null; then
    echo "   ✅ GitHub MCP 服务器已安装"
else
    echo "   ❌ GitHub MCP 服务器未找到"
    exit 1
fi

# 检查配置文件
echo "2. 检查 Claude Desktop 配置文件..."
CONFIG_FILE="$HOME/.config/claude/claude_desktop_config.json"
if [ -f "$CONFIG_FILE" ]; then
    echo "   ✅ 配置文件存在: $CONFIG_FILE"
    
    # 检查是否包含 GitHub 配置
    if grep -q "github" "$CONFIG_FILE"; then
        echo "   ✅ GitHub MCP 服务器已在配置中"
        
        # 检查是否设置了令牌
        if grep -q '"GITHUB_PERSONAL_ACCESS_TOKEN": ""' "$CONFIG_FILE"; then
            echo "   ⚠️  需要设置 GitHub 个人访问令牌"
            echo "      请查看 GITHUB_MCP_SETUP.md 了解详细步骤"
        else
            echo "   ✅ GitHub 令牌已配置"
        fi
    else
        echo "   ❌ GitHub MCP 服务器未在配置中"
    fi
else
    echo "   ❌ 配置文件不存在"
fi

echo ""
echo "📋 下一步操作："
echo "1. 获取 GitHub 个人访问令牌 (如果还没有)"
echo "2. 编辑配置文件: $CONFIG_FILE"
echo "3. 重启 Claude Desktop 应用程序"
echo "4. 在 Claude 中测试: '显示我的 GitHub 仓库'"

# 显示当前配置
echo ""
echo "📄 当前配置内容:"
echo "=================="
if [ -f "$CONFIG_FILE" ]; then
    cat "$CONFIG_FILE"
else
    echo "配置文件不存在"
fi