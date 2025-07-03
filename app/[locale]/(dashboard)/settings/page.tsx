"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { 
  Settings,
  Save,
  RefreshCw,
  Globe,
  Users,
  Shield,
  Zap,
  Info,
  Clock,
  MapPin,
  Mail,
  Phone,
  ImageIcon,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ClubSettings {
  // 基本信息
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  timezone: string;
  defaultLanguage: string;
  
  // 游戏设置
  allowGuests: boolean;
  autoApproveMembers: boolean;
  maxMembersPerTable: number;
  defaultRakePercentage: number;
  tournamentFeePercentage: number;
  
  // 安全设置
  requireEmailVerification: boolean;
  twoFactorRequired: boolean;
  sessionTimeout: number;
  
  // 通知设置
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
  { value: 'Asia/Taipei', label: '台北时间 (UTC+8)' },
  { value: 'Asia/Tokyo', label: '东京时间 (UTC+9)' },
  { value: 'Asia/Kuala_Lumpur', label: '吉隆坡时间 (UTC+8)' },
  { value: 'Asia/Singapore', label: '新加坡时间 (UTC+8)' },
  { value: 'UTC', label: 'UTC时间' }
];

const LANGUAGE_OPTIONS = [
  { value: 'zh', label: '简体中文' },
  { value: 'zh-TW', label: '繁体中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' }
];

export default function ClubSettingsPage() {
  const t = useTranslations('Settings');
  const { selectedClub, user } = useUserStore();
  const [settings, setSettings] = useState<ClubSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'game' | 'security' | 'notifications' | 'ai'>('basic');

  // 检查管理权限
  const hasManagePermission = user?.role && ['OWNER', 'ADMIN'].includes(user.role);

  // 获取俱乐部设置
  useEffect(() => {
    if (!selectedClub || !hasManagePermission) return;
    
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/clubs/${selectedClub.id}/settings`);
        const data = await response.json();

        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error('获取俱乐部设置失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [selectedClub, hasManagePermission]);

  // 保存设置
  const saveSettings = async () => {
    if (!selectedClub || !settings) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/clubs/${selectedClub.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        alert(t('save_success'));
      } else {
        alert(t('save_failed'));
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      alert(t('save_failed'));
    } finally {
      setSaving(false);
    }
  };

  // 更新设置
  const updateSetting = (key: keyof ClubSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  // 标签页配置
  const tabs = [
    { key: 'basic', label: t('tabs.basic'), icon: Info },
    { key: 'game', label: t('tabs.game'), icon: Users },
    { key: 'security', label: t('tabs.security'), icon: Shield },
    { key: 'notifications', label: t('tabs.notifications'), icon: Mail },
    { key: 'ai', label: t('tabs.ai'), icon: Zap }
  ];

  if (!hasManagePermission) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_permission.title')}</h3>
          <p className="text-gray-500">{t('no_permission.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {t('reset')}
          </button>
          <button
            onClick={saveSettings}
            disabled={saving || !settings}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 标签页导航 */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 设置内容 */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : !settings ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('load_failed.title')}</h3>
              <p className="text-gray-500">{t('load_failed.description')}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* 基本信息 */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">{t('basic.title')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('basic.club_name')}
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => updateSetting('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('basic.email')}
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => updateSetting('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('basic.phone')}
                      </label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => updateSetting('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('basic.website')}
                      </label>
                      <input
                        type="url"
                        value={settings.website || ''}
                        onChange={(e) => updateSetting('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('basic.timezone')}
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => updateSetting('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {TIMEZONE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('basic.default_language')}
                      </label>
                      <select
                        value={settings.defaultLanguage}
                        onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {LANGUAGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('basic.description')}
                    </label>
                    <textarea
                      value={settings.description}
                      onChange={(e) => updateSetting('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('basic.description_placeholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('basic.address')}
                    </label>
                    <textarea
                      value={settings.address}
                      onChange={(e) => updateSetting('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('basic.address_placeholder')}
                    />
                  </div>
                </div>
              )}

              {/* AI 配置 */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{t('ai.title')}</h3>
                    <Link
                      href="/settings/ai"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Zap className="h-4 w-4" />
                      {t('ai.configure_ai')}
                    </Link>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900 mb-2">{t('ai.description.title')}</h4>
                        <p className="text-sm text-purple-700 mb-4">{t('ai.description.text')}</p>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• {t('ai.features.personality')}</li>
                          <li>• {t('ai.features.welcome_message')}</li>
                          <li>• {t('ai.features.response_style')}</li>
                          <li>• {t('ai.features.specialized_knowledge')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 其他标签页的占位符内容 */}
              {(activeTab === 'game' || activeTab === 'security' || activeTab === 'notifications') && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t(`${activeTab}.title`)}
                  </h3>
                  
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">{t('coming_soon.title')}</p>
                    <p className="text-sm text-gray-400">{t('coming_soon.description')}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}