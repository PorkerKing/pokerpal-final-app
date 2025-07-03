"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { 
  ShoppingBag,
  Search,
  Filter,
  Coffee,
  Shirt,
  Gift,
  Trophy,
  Star,
  ArrowRight,
  Package,
  Clock,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: string;
  isActive: boolean;
  stock: number;
  clubId: string;
}

const categoryIcons = {
  BEVERAGE: Coffee,
  MERCHANDISE: Shirt,
  SERVICE: Gift,
  TOURNAMENT_TICKET: Trophy
};

const categoryColors = {
  BEVERAGE: 'text-orange-600 bg-orange-100',
  MERCHANDISE: 'text-blue-600 bg-blue-100',
  SERVICE: 'text-green-600 bg-green-100',
  TOURNAMENT_TICKET: 'text-purple-600 bg-purple-100'
};

export default function StorePage() {
  const t = useTranslations('Store');
  const { selectedClub, user } = useUserStore();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userPoints, setUserPoints] = useState(0);

  // 获取商城物品
  useEffect(() => {
    if (!selectedClub) return;
    
    const fetchStoreItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/clubs/${selectedClub.id}/store`);
        const data = await response.json();

        if (data.success) {
          setItems(data.data.items || []);
          setUserPoints(data.data.userPoints || 0);
        }
      } catch (error) {
        console.error('获取商城物品失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreItems();
  }, [selectedClub]);

  // 兑换物品
  const redeemItem = async (itemId: string) => {
    if (!selectedClub) return;

    try {
      const response = await fetch(`/api/clubs/${selectedClub.id}/store/${itemId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        alert(t('redeem.success'));
        // 刷新页面数据
        window.location.reload();
      } else {
        alert(data.message || t('redeem.failed'));
      }
    } catch (error) {
      console.error('兑换失败:', error);
      alert(t('redeem.failed'));
    }
  };

  // 筛选物品
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.isActive;
  });

  // 渲染分类徽章
  const renderCategoryBadge = (category: string) => {
    const Icon = categoryIcons[category as keyof typeof categoryIcons] || Package;
    const colorClass = categoryColors[category as keyof typeof categoryColors] || 'text-gray-600 bg-gray-100';
    
    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', colorClass)}>
        <Icon className="h-3 w-3" />
        {t(`categories.${category.toLowerCase()}`)}
      </span>
    );
  };

  // 渲染物品卡片
  const renderItemCard = (item: StoreItem) => {
    const canAfford = userPoints >= item.pointsRequired;
    const inStock = item.stock > 0;
    const canRedeem = canAfford && inStock;

    return (
      <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
            {renderCategoryBadge(item.category)}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-600 font-bold text-lg">
              <Star className="h-4 w-4" />
              {item.pointsRequired.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t('points_required')}
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package className="h-4 w-4" />
            <span>{t('stock')}: {item.stock}</span>
          </div>

          <button
            onClick={() => canRedeem && redeemItem(item.id)}
            disabled={!canRedeem}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
              canRedeem
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {!inStock ? (
              <>
                <Clock className="h-4 w-4" />
                {t('out_of_stock')}
              </>
            ) : !canAfford ? (
              <>
                <Star className="h-4 w-4" />
                {t('insufficient_points')}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                {t('redeem_now')}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (!selectedClub) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_club_selected.title')}</h3>
          <p className="text-gray-500">{t('no_club_selected.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和积分显示 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-lg font-bold text-yellow-700">{userPoints.toLocaleString()}</div>
              <div className="text-xs text-yellow-600">{t('my_points')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 */}
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 分类筛选 */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">{t('categories.all')}</option>
          <option value="BEVERAGE">{t('categories.beverage')}</option>
          <option value="MERCHANDISE">{t('categories.merchandise')}</option>
          <option value="SERVICE">{t('categories.service')}</option>
          <option value="TOURNAMENT_TICKET">{t('categories.tournament_ticket')}</option>
        </select>
      </div>

      {/* 商品列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
          <p className="text-gray-600">{t('empty.description')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(renderItemCard)}
        </div>
      )}

      {/* 积分说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">{t('points_info.title')}</h3>
        <p className="text-blue-700 text-sm mb-3">{t('points_info.description')}</p>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• {t('points_info.earn_playing')}</li>
          <li>• {t('points_info.earn_tournaments')}</li>
          <li>• {t('points_info.earn_achievements')}</li>
        </ul>
      </div>
    </div>
  );
}