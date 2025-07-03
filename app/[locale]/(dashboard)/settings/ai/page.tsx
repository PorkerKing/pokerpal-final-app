"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { Bot, Save, RotateCcw, Palette, MessageSquare, Settings2, Globe, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AIPersona {
  id?: string;
  clubId: string;
  name: string;
  personality: string;
  systemPrompt: string;
  capabilities: {
    tournaments: boolean;
    ringGames: boolean;
    memberManagement: boolean;
    statistics: boolean;
  };
  style: {
    tone: 'professional' | 'friendly' | 'casual' | 'formal';
    language: 'zh' | 'en' | 'ja' | 'zh-TW';
    emoji: boolean;
    verbosity: 'concise' | 'detailed' | 'comprehensive';
  };
}

const defaultPersona: AIPersona = {
  clubId: '',
  name: 'PokerPal 助手',
  personality: '我是一个专业、友好的扑克俱乐部助手。我了解扑克规则，能够帮助用户报名参加锦标赛，查询战绩，并提供各种俱乐部服务。我总是礼貌耐心，用简洁明了的语言回答问题。',
  systemPrompt: '你是 PokerPal 俱乐部的专属AI助手。请用中文与用户交流，提供专业的扑克俱乐部服务。',
  capabilities: {
    tournaments: true,
    ringGames: true,
    memberManagement: true,
    statistics: true
  },
  style: {
    tone: 'friendly',
    language: 'zh',
    emoji: true,
    verbosity: 'detailed'
  }
};

export default function AISettingsPage() {
  const { data: session } = useSession();
  const t = useTranslations('Settings');
  const { selectedClub } = useUserStore();
  const [persona, setPersona] = useState<AIPersona>(defaultPersona);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'personality' | 'capabilities' | 'style'>('basic');

  // 检查权限
  const userRole = (selectedClub as any)?.userMembership?.role;
  const hasEditPermission = ['OWNER', 'ADMIN'].includes(userRole);

  useEffect(() => {
    if (selectedClub) {
      loadPersona();
    }
  }, [selectedClub]);

  const loadPersona = async () => {
    if (!selectedClub) return;
    
    try {
      const response = await fetch(`/api/clubs/${selectedClub.id}/ai-persona`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPersona({ ...defaultPersona, ...data.data, clubId: selectedClub.id });
        } else {
          setPersona({ ...defaultPersona, clubId: selectedClub.id });
        }
      }
    } catch (error) {
      console.error('加载AI设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePersona = async () => {
    if (!selectedClub || !hasEditPermission) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/clubs/${selectedClub.id}/ai-persona`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
      });
      
      if (response.ok) {
        alert('AI设置保存成功！');
      } else {
        alert('保存失败，请重试');
      }
    } catch (error) {
      console.error('保存AI设置失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (confirm('确定要重置为默认设置吗？')) {
      setPersona({ ...defaultPersona, clubId: selectedClub?.id || '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">加载设置中...</p>
        </div>
      </div>
    );
  }

  if (!hasEditPermission) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Settings2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">权限不足</h3>
          <p className="text-gray-500">只有俱乐部所有者和管理员可以配置AI设置</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI助手配置</h1>
          </div>
          <p className="text-gray-600">自定义您的AI助手，打造专属的俱乐部服务体验</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧标签页 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <nav className="space-y-2">
              {[
                { key: 'basic', label: '基本信息', icon: Bot },
                { key: 'personality', label: '个性设置', icon: MessageSquare },
                { key: 'capabilities', label: '功能权限', icon: Settings2 },
                { key: 'style', label: '交互风格', icon: Palette }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                    activeTab === key 
                      ? "bg-purple-100 text-purple-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* 基本信息 */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI助手名称
                      </label>
                      <input
                        type="text"
                        value={persona.name}
                        onChange={(e) => setPersona(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="例如：PokerPal 小助手"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        系统提示词
                      </label>
                      <textarea
                        value={persona.systemPrompt}
                        onChange={(e) => setPersona(prev => ({ ...prev, systemPrompt: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="定义AI助手的基本行为和回应风格..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 个性设置 */}
            {activeTab === 'personality' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">个性特征</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      个性描述
                    </label>
                    <textarea
                      value={persona.personality}
                      onChange={(e) => setPersona(prev => ({ ...prev, personality: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="描述AI助手的性格特点、服务风格等..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      详细描述AI的性格特点，这将影响其回应的风格和语调
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 功能权限 */}
            {activeTab === 'capabilities' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">功能权限</h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'tournaments', label: '锦标赛管理', desc: '允许AI帮助创建、管理锦标赛和处理报名' },
                      { key: 'ringGames', label: '圆桌游戏', desc: '允许AI管理圆桌游戏和座位安排' },
                      { key: 'memberManagement', label: '会员管理', desc: '允许AI查看和管理会员信息' },
                      { key: 'statistics', label: '数据统计', desc: '允许AI访问和分析俱乐部运营数据' }
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          checked={persona.capabilities[key as keyof typeof persona.capabilities]}
                          onChange={(e) => setPersona(prev => ({
                            ...prev,
                            capabilities: {
                              ...prev.capabilities,
                              [key]: e.target.checked
                            }
                          }))}
                          className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{label}</h4>
                          <p className="text-sm text-gray-600">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 交互风格 */}
            {activeTab === 'style' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">交互风格</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        语调风格
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'professional', label: '专业正式' },
                          { value: 'friendly', label: '友好亲切' },
                          { value: 'casual', label: '轻松随意' },
                          { value: 'formal', label: '严肃正经' }
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setPersona(prev => ({ ...prev, style: { ...prev.style, tone: value as any } }))}
                            className={cn(
                              "p-3 text-left border rounded-lg transition-colors",
                              persona.style.tone === value
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-300 hover:border-gray-400"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        主要语言
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'zh', label: '简体中文' },
                          { value: 'zh-TW', label: '繁体中文' },
                          { value: 'en', label: 'English' },
                          { value: 'ja', label: '日本語' }
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setPersona(prev => ({ ...prev, style: { ...prev.style, language: value as any } }))}
                            className={cn(
                              "p-3 text-left border rounded-lg transition-colors",
                              persona.style.language === value
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-300 hover:border-gray-400"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        回复详细程度
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'concise', label: '简洁明了' },
                          { value: 'detailed', label: '详细说明' },
                          { value: 'comprehensive', label: '全面详尽' }
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setPersona(prev => ({ ...prev, style: { ...prev.style, verbosity: value as any } }))}
                            className={cn(
                              "p-3 text-left border rounded-lg transition-colors",
                              persona.style.verbosity === value
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-300 hover:border-gray-400"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={persona.style.emoji}
                        onChange={(e) => setPersona(prev => ({ ...prev, style: { ...prev.style, emoji: e.target.checked } }))}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        使用表情符号让对话更生动
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
              <button
                onClick={resetToDefault}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                重置为默认
              </button>

              <button
                onClick={savePersona}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />
                {saving ? '保存中...' : '保存设置'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}