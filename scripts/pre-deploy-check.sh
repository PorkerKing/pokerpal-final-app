#!/bin/bash

# PokerPal 部署前检查脚本
# Pre-deployment check script for PokerPal

echo "🚀 PokerPal 部署前检查开始..."
echo "=================================="

# 检查 Node.js 版本
echo "📦 检查 Node.js 版本..."
node_version=$(node -v)
echo "Node.js 版本: $node_version"

# 检查包管理器
echo "📦 检查包管理器..."
if command -v npm >/dev/null 2>&1; then
    npm_version=$(npm -v)
    echo "npm 版本: $npm_version"
fi

# 检查环境变量
echo "🔧 检查环境变量..."
if [ -f ".env" ]; then
    echo "✅ .env 文件存在"
    
    # 检查关键环境变量
    required_vars=("NEXTAUTH_SECRET" "XAI_API_KEY" "GITHUB_CLIENT_ID" "GITHUB_CLIENT_SECRET")
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            echo "✅ $var 已配置"
        else
            echo "❌ $var 缺失或未配置"
        fi
    done
else
    echo "❌ .env 文件不存在"
fi

# 检查生产环境配置
echo "🚀 检查生产环境配置..."
if [ -f ".env.production" ]; then
    echo "✅ .env.production 文件存在"
else
    echo "⚠️  .env.production 文件不存在（可选）"
fi

# 检查关键文件
echo "📁 检查关键文件..."
critical_files=(
    "package.json"
    "next.config.js"
    "tailwind.config.js"
    "prisma/schema.prisma"
    "components/UnifiedSidebar.tsx"
    "lib/z-index.ts"
    "components/SaaSFeatures.tsx"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 缺失"
    fi
done

# 检查依赖
echo "📦 检查依赖安装..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules 存在"
    
    # 检查关键依赖
    key_deps=("next" "react" "prisma" "next-auth" "lucide-react")
    
    for dep in "${key_deps[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            echo "✅ $dep 已安装"
        else
            echo "❌ $dep 未安装"
        fi
    done
else
    echo "❌ node_modules 不存在，需要运行 npm install"
fi

# 检查构建配置
echo "🔨 检查构建配置..."
if npm run build --dry-run >/dev/null 2>&1; then
    echo "✅ 构建脚本配置正确"
else
    echo "⚠️  构建脚本可能有问题"
fi

# 检查TypeScript配置
echo "📝 检查TypeScript配置..."
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json 存在"
    
    # 检查TypeScript编译
    if npx tsc --noEmit >/dev/null 2>&1; then
        echo "✅ TypeScript 编译通过"
    else
        echo "⚠️  TypeScript 编译有警告或错误"
    fi
else
    echo "❌ tsconfig.json 不存在"
fi

# 检查Prisma配置
echo "🗄️  检查数据库配置..."
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Prisma schema 存在"
    
    # 检查Prisma生成
    if npx prisma generate --dry-run >/dev/null 2>&1; then
        echo "✅ Prisma 生成配置正确"
    else
        echo "⚠️  Prisma 生成可能有问题"
    fi
else
    echo "❌ Prisma schema 不存在"
fi

# 检查i18n配置
echo "🌍 检查国际化配置..."
i18n_files=("i18n.ts" "messages/zh.json" "messages/en.json")

for file in "${i18n_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "⚠️  $file 不存在"
    fi
done

# 检查Vercel配置
echo "☁️  检查Vercel配置..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json 存在"
else
    echo "⚠️  vercel.json 不存在（可选）"
fi

# 总结
echo ""
echo "=================================="
echo "🎯 部署前检查完成！"
echo ""
echo "📋 建议的部署步骤："
echo "1. 确保所有❌标记的问题都已解决"
echo "2. 运行 npm run build 进行本地构建测试"
echo "3. 配置Vercel环境变量"
echo "4. 部署到Vercel"
echo "5. 验证所有功能正常工作"
echo ""
echo "🔗 有用的链接："
echo "- 部署指南: DEPLOYMENT_GUIDE.md"
echo "- 检查清单: DEPLOYMENT_CHECKLIST.md"
echo "- 修复报告: URGENT_FIXES_APPLIED.md"
echo ""
echo "✨ 祝您部署顺利！"