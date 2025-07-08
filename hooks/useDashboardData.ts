"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface DashboardStats {
  totalMembers: number;
  activeTournaments: number;
  todayRevenue: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

export function useDashboardData() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeTournaments: 0,
    todayRevenue: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/summary');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // 设置默认值作为后备
      setStats({
        totalMembers: 0,
        activeTournaments: 0,
        todayRevenue: 0,
        recentActivities: [
          {
            id: '1',
            type: 'info',
            description: '无法获取实时数据，显示默认信息',
            timestamp: new Date()
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [session]);

  return { stats, loading, error, refetch: fetchDashboardData };
}