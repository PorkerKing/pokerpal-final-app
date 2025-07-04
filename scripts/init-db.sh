#!/bin/bash

echo "初始化 PokerPal 数据库..."

# 使用直接连接字符串（非pooler）进行数据库迁移
# 注意：迁移需要使用端口 5432 的直接连接
export DATABASE_URL="postgresql://postgres.pkjkbvvpthneaciyxskv:Githubisgood1~@aws-0-ap-northeast-1.data.supabase.com:5432/postgres"

echo "1. 推送数据库架构..."
npx prisma db push --skip-generate

echo "2. 生成 Prisma 客户端..."
npx prisma generate

echo "3. 运行种子数据..."
npx prisma db seed

echo "✅ 数据库初始化完成！"