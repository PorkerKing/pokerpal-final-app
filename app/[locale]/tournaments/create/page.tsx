"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSelectedClub } from '@/stores/userStore';
import { useRouter } from '@/navigation';
import { Link } from '@/navigation';
import { 
  ArrowLeft, 
  Save, 
  Calendar,
  Users,
  Trophy,
  DollarSign,
  Settings,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 表单数据类型
interface TournamentFormData {
  name: string;
  description: string;
  gameType: string;
  buyIn: number;
  fee: number;
  rebuyAmount?: number;
  addonAmount?: number;
  startingStack: number;
  startTime: string;
  lateRegEndTime?: string;
  estimatedDuration?: number;
  minPlayers: number;
  maxPlayers?: number;
  blindStructureId: string;
  payoutStructureId: string;
  tags: string[];
}

// 表单字段组件
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

const FormField = ({ label, children, required, error }: FormFieldProps) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-sm text-red-600">{error}</p>
    )}
  </div>
);

// 表单分组组件
interface FormSectionProps {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}

const FormSection = ({ title, icon: Icon, children }: FormSectionProps) => (
  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
    <div className="flex items-center gap-2 mb-6">
      <Icon size={20} className="text-purple-600" />
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

export default function CreateTournamentPage() {
  const t = useTranslations('Tournaments.create');
  const selectedClub = useSelectedClub();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [blindStructures, setBlindStructures] = useState<Array<{id: string, name: string}>>([]);
  const [payoutStructures, setPayoutStructures] = useState<Array<{id: string, name: string}>>([]);

  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    description: '',
    gameType: 'NLH',
    buyIn: 100,
    fee: 10,
    rebuyAmount: undefined,
    addonAmount: undefined,
    startingStack: 10000,
    startTime: '',
    lateRegEndTime: undefined,
    estimatedDuration: 180,
    minPlayers: 6,
    maxPlayers: undefined,
    blindStructureId: '',
    payoutStructureId: '',
    tags: []
  });

  const userRole = (selectedClub as any)?.userMembership?.role || 'GUEST';
  const canCreate = ['OWNER', 'ADMIN', 'MANAGER'].includes(userRole);

  // 获取盲注结构和支付结构
  useEffect(() => {
    if (!selectedClub) return;

    const fetchStructures = async () => {
      try {
        // 获取盲注结构
        const blindResponse = await fetch(`/api/clubs/${selectedClub.id}/blind-structures`);
        if (blindResponse.ok) {
          const blindData = await blindResponse.json();
          if (blindData.success) {
            setBlindStructures(blindData.data.items || []);
            if (blindData.data.items.length > 0) {
              setFormData(prev => ({ ...prev, blindStructureId: blindData.data.items[0].id }));
            }
          }
        }

        // 获取支付结构
        const payoutResponse = await fetch(`/api/clubs/${selectedClub.id}/payout-structures`);
        if (payoutResponse.ok) {
          const payoutData = await payoutResponse.json();
          if (payoutData.success) {
            setPayoutStructures(payoutData.data.items || []);
            if (payoutData.data.items.length > 0) {
              setFormData(prev => ({ ...prev, payoutStructureId: payoutData.data.items[0].id }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch structures:', error);
      }
    };

    fetchStructures();
  }, [selectedClub]);

  // 处理表单字段变化
  const handleChange = (field: keyof TournamentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '锦标赛名称不能为空';
    }

    if (formData.buyIn <= 0) {
      newErrors.buyIn = '报名费必须大于0';
    }

    if (formData.fee < 0) {
      newErrors.fee = '手续费不能为负数';
    }

    if (formData.startingStack <= 0) {
      newErrors.startingStack = '起始筹码必须大于0';
    }

    if (!formData.startTime) {
      newErrors.startTime = '请选择开始时间';
    }

    if (formData.minPlayers < 2) {
      newErrors.minPlayers = '最少玩家数不能小于2';
    }

    if (formData.maxPlayers && formData.maxPlayers < formData.minPlayers) {
      newErrors.maxPlayers = '最多玩家数不能小于最少玩家数';
    }

    if (!formData.blindStructureId) {
      newErrors.blindStructureId = '请选择盲注结构';
    }

    if (!formData.payoutStructureId) {
      newErrors.payoutStructureId = '请选择支付结构';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreate) {
      alert('您没有权限创建锦标赛');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clubId: selectedClub?.id,
          // 清理空值
          rebuyAmount: formData.rebuyAmount || undefined,
          addonAmount: formData.addonAmount || undefined,
          lateRegEndTime: formData.lateRegEndTime || undefined,
          estimatedDuration: formData.estimatedDuration || undefined,
          maxPlayers: formData.maxPlayers || undefined,
        })
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/tournaments');
      } else {
        alert(data.error || '创建失败');
      }
    } catch (error) {
      alert('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedClub) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">请先选择一个俱乐部</p>
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">您没有权限创建锦标赛</p>
        <Link href="/tournaments" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
          返回锦标赛列表
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link href="/tournaments">
          <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{selectedClub.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <FormSection title={t('basicInfo')} icon={Trophy}>
          <FormField label={t('name')} required error={errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="例如：周末保证金锦标赛"
            />
          </FormField>

          <FormField label={t('description')}>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="锦标赛描述..."
            />
          </FormField>

          <FormField label={t('gameType')} required>
            <select
              value={formData.gameType}
              onChange={(e) => handleChange('gameType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="NLH">No Limit Hold'em</option>
              <option value="PLO">Pot Limit Omaha</option>
              <option value="PLO5">5-Card PLO</option>
              <option value="MIXED">Mixed Games</option>
              <option value="OTHER">其他</option>
            </select>
          </FormField>
        </FormSection>

        {/* 游戏设置 */}
        <FormSection title={t('gameSettings')} icon={Settings}>
          <FormField label={t('buyIn')} required error={errors.buyIn}>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={formData.buyIn}
                onChange={(e) => handleChange('buyIn', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </FormField>

          <FormField label={t('fee')} error={errors.fee}>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={formData.fee}
                onChange={(e) => handleChange('fee', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </FormField>

          <FormField label={t('startingStack')} required error={errors.startingStack}>
            <input
              type="number"
              value={formData.startingStack}
              onChange={(e) => handleChange('startingStack', parseInt(e.target.value) || 0)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </FormField>

          <FormField label={`${t('minPlayers')} / ${t('maxPlayers')}`} error={errors.minPlayers || errors.maxPlayers}>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.minPlayers}
                onChange={(e) => handleChange('minPlayers', parseInt(e.target.value) || 0)}
                min="2"
                placeholder="最少"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="self-center text-gray-500">/</span>
              <input
                type="number"
                value={formData.maxPlayers || ''}
                onChange={(e) => handleChange('maxPlayers', e.target.value ? parseInt(e.target.value) : undefined)}
                min={formData.minPlayers}
                placeholder="最多(可选)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </FormField>
        </FormSection>

        {/* 时间安排 */}
        <FormSection title={t('schedule')} icon={Clock}>
          <FormField label={t('startTime')} required error={errors.startTime}>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="预计时长 (分钟)">
            <input
              type="number"
              value={formData.estimatedDuration || ''}
              onChange={(e) => handleChange('estimatedDuration', e.target.value ? parseInt(e.target.value) : undefined)}
              min="30"
              placeholder="180"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="盲注结构" required error={errors.blindStructureId}>
            <select
              value={formData.blindStructureId}
              onChange={(e) => handleChange('blindStructureId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">请选择盲注结构</option>
              {blindStructures.map((structure) => (
                <option key={structure.id} value={structure.id}>
                  {structure.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="支付结构" required error={errors.payoutStructureId}>
            <select
              value={formData.payoutStructureId}
              onChange={(e) => handleChange('payoutStructureId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">请选择支付结构</option>
              {payoutStructures.map((structure) => (
                <option key={structure.id} value={structure.id}>
                  {structure.name}
                </option>
              ))}
            </select>
          </FormField>
        </FormSection>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/tournaments">
            <button
              type="button"
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2 font-medium rounded-lg transition-colors",
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            )}
          >
            <Save size={16} />
            {loading ? '创建中...' : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}