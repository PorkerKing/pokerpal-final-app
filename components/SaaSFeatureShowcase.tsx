"use client";

import { useState } from 'react';
import { Bot, Database, Users, Trophy, DollarSign, TrendingUp, MessageSquare, Shield, Globe, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FeatureDemo {
  id: string;
  icon: any;
  title: string;
  description: string;
  demoText: string;
  highlight: string;
}

export function SaaSFeatureShowcase() {
  const t = useTranslations('SaaSFeatures');
  const [activeFeature, setActiveFeature] = useState<string>('ai-assistant');

  const features: FeatureDemo[] = [
    {
      id: 'ai-assistant',
      icon: Bot,
      title: '🤖 AI智能客服',
      description: '为每个俱乐部定制专属AI客服，具备独特人设和地方特色',
      demoText: '上海雅茜：「侬晓得伐，这个策略蛮好额...」\n台北心怡：「欸～穩住，我們能贏！」\n大阪美ちゃん：「やったるで！めっちゃええやん♪」\n吉隆坡Aisha：「Masha\'Allah, excellent strategy! 🌙」',
      highlight: '4种独特人设 × 本地化特色'
    },
    {
      id: 'database-operations',
      icon: Database,
      title: '🗄️ 自然语言数据库操作',
      description: '用AI直接操作数据库，无需复杂界面，自然语言即可完成管理',
      demoText: '「帮我调整张三的余额，增加500元」\n→ 系统自动执行SQL操作并记录审计日志\n\n「查询本月锦标赛参与人数」\n→ 实时生成统计报表',
      highlight: '革命性SaaS创新'
    },
    {
      id: 'multi-tenant',
      icon: Users,
      title: '🏢 多租户架构',
      description: '完全隔离的俱乐部数据，支持无限扩展',
      demoText: '✅ 用户数据按俱乐部隔离\n✅ 聊天记录独立管理\n✅ 权限体系分级控制\n✅ 财务数据安全隔离',
      highlight: '企业级数据安全'
    },
    {
      id: 'tournament-management',
      icon: Trophy,
      title: '🏆 智能锦标赛管理',
      description: '从报名到结算的全流程自动化管理',
      demoText: '📅 智能排期 → 🎫 在线报名 → 💰 自动扣款 → 📊 实时统计 → 🏅 奖金分配',
      highlight: '全流程自动化'
    },
    {
      id: 'financial-system',
      icon: DollarSign,
      title: '💰 金融级财务系统',
      description: '支持余额管理、积分系统、交易记录等完整财务功能',
      demoText: '🏦 余额管理：充值/提现/转账\n⭐ 积分系统：赚取/兑换/奖励\n📈 交易记录：完整审计追踪\n📊 财务报表：实时统计分析',
      highlight: '金融级安全标准'
    },
    {
      id: 'analytics',
      icon: TrendingUp,
      title: '📊 智能数据分析',
      description: '深度数据洞察，助力俱乐部运营决策',
      demoText: '📈 会员增长趋势\n🎯 活跃度分析\n💡 收入预测\n🔍 用户行为洞察',
      highlight: 'AI驱动的商业洞察'
    }
  ];

  const activeFeatureData = features.find(f => f.id === activeFeature) || features[0];

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          🚀 PokerPal SaaS 核心功能展示
        </h2>
        <p className="text-gray-400">
          下一代德州扑克俱乐部管理平台 • 完备的SaaS解决方案
        </p>
      </div>

      {/* 功能选择按钮 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          
          return (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`p-3 rounded-lg text-left transition-all ${
                isActive 
                  ? 'bg-purple-600/30 border-purple-500/50 border text-white' 
                  : 'bg-gray-800/50 border-gray-600/30 border text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} />
                <span className="text-sm font-medium">{feature.title}</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">{feature.description}</p>
            </button>
          );
        })}
      </div>

      {/* 功能详细展示 */}
      <div className="bg-gray-900/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {activeFeatureData.title}
          </h3>
          <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs">
            {activeFeatureData.highlight}
          </span>
        </div>
        
        <p className="text-gray-300 text-sm leading-relaxed">
          {activeFeatureData.description}
        </p>
        
        <div className="bg-black/40 rounded-lg p-3 border border-gray-700/30">
          <div className="text-xs text-gray-500 mb-2">💻 功能演示：</div>
          <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono leading-relaxed">
            {activeFeatureData.demoText}
          </pre>
        </div>
      </div>

      {/* 技术亮点 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
          <MessageSquare className="mx-auto mb-2 text-blue-400" size={20} />
          <div className="text-sm font-medium text-white">AI对话</div>
          <div className="text-xs text-gray-400">自然语言交互</div>
        </div>
        <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-3">
          <Shield className="mx-auto mb-2 text-green-400" size={20} />
          <div className="text-sm font-medium text-white">企业安全</div>
          <div className="text-xs text-gray-400">多重数据保护</div>
        </div>
        <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-3">
          <Globe className="mx-auto mb-2 text-purple-400" size={20} />
          <div className="text-sm font-medium text-white">多语言</div>
          <div className="text-xs text-gray-400">国际化支持</div>
        </div>
        <div className="bg-orange-600/10 border border-orange-500/20 rounded-lg p-3">
          <Zap className="mx-auto mb-2 text-orange-400" size={20} />
          <div className="text-sm font-medium text-white">高性能</div>
          <div className="text-xs text-gray-400">云原生架构</div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-2 border-t border-gray-700/30">
        <p className="text-sm text-gray-400 mb-3">
          🎯 这是概念验证版本，展示完整SaaS平台的核心功能
        </p>
        <div className="flex justify-center gap-3">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            🚀 了解更多
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            📞 商务合作
          </button>
        </div>
      </div>
    </div>
  );
}