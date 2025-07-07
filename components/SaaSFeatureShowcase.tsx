"use client";

import { useState } from 'react';
import { Bot, Database, Users, Trophy, DollarSign, TrendingUp, MessageSquare, Shield, Globe, Zap, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FeatureDemo {
  id: string;
  icon: any;
  title: string;
  description: string;
  demoText: string;
  highlight: string;
}

interface SaaSFeatureShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaaSFeatureShowcase({ isOpen, onClose }: SaaSFeatureShowcaseProps) {
  const t = useTranslations('SaaSFeatures');
  const [activeFeature, setActiveFeature] = useState<string>('ai-assistant');

  if (!isOpen) return null;

  const features: FeatureDemo[] = [
    {
      id: 'ai-assistant',
      icon: Bot,
      title: t('aiAssistant.title'),
      description: t('aiAssistant.description'),
      demoText: t('aiAssistant.demo'),
      highlight: t('aiAssistant.highlight')
    },
    {
      id: 'database-operations',
      icon: Database,
      title: t('databaseOps.title'),
      description: t('databaseOps.description'),
      demoText: t('databaseOps.demo'),
      highlight: t('databaseOps.highlight')
    },
    {
      id: 'multi-tenant',
      icon: Users,
      title: t('multiTenant.title'),
      description: t('multiTenant.description'),
      demoText: t('multiTenant.demo'),
      highlight: t('multiTenant.highlight')
    },
    {
      id: 'tournament-management',
      icon: Trophy,
      title: t('tournament.title'),
      description: t('tournament.description'),
      demoText: t('tournament.demo'),
      highlight: t('tournament.highlight')
    },
    {
      id: 'financial-system',
      icon: DollarSign,
      title: t('financial.title'),
      description: t('financial.description'),
      demoText: t('financial.demo'),
      highlight: t('financial.highlight')
    },
    {
      id: 'analytics',
      icon: TrendingUp,
      title: t('analytics.title'),
      description: t('analytics.description'),
      demoText: t('analytics.demo'),
      highlight: t('analytics.highlight')
    }
  ];

  const activeFeatureData = features.find(f => f.id === activeFeature) || features[0];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-gray-700/50 rounded-2xl p-6 space-y-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('title')}
            </h2>
            <p className="text-gray-400">
              {t('subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
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
            <div className="text-sm font-medium text-white">{t('features.aiChat')}</div>
            <div className="text-xs text-gray-400">{t('features.aiChatDesc')}</div>
          </div>
          <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-3">
            <Shield className="mx-auto mb-2 text-green-400" size={20} />
            <div className="text-sm font-medium text-white">{t('features.enterpriseSecurity')}</div>
            <div className="text-xs text-gray-400">{t('features.enterpriseSecurityDesc')}</div>
          </div>
          <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-3">
            <Globe className="mx-auto mb-2 text-purple-400" size={20} />
            <div className="text-sm font-medium text-white">{t('features.multiLanguage')}</div>
            <div className="text-xs text-gray-400">{t('features.multiLanguageDesc')}</div>
          </div>
          <div className="bg-orange-600/10 border border-orange-500/20 rounded-lg p-3">
            <Zap className="mx-auto mb-2 text-orange-400" size={20} />
            <div className="text-sm font-medium text-white">{t('features.highPerformance')}</div>
            <div className="text-xs text-gray-400">{t('features.highPerformanceDesc')}</div>
          </div>
        </div>

        {/* 概念验证说明 */}
        <div className="text-center pt-2 border-t border-gray-700/30">
          <p className="text-sm text-gray-400">
            🎯 {t('demoHint')}
          </p>
        </div>
      </div>
    </div>
  );
}