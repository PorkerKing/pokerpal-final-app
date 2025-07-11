import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Prisma } from '@prisma/client';
import type { Session } from 'next-auth';

// 类型定义
type Club = Prisma.ClubGetPayload<{
  include: {
    aiPersona: {
      select: {
        name: true;
      };
    };
  };
}> & {
  userMembership?: {
    role: string;
    balance: number;
    vipLevel: number;
    joinDate: Date;
  };
  memberCount?: number;
  tournamentCount?: number;
  ringGameTableCount?: number;
};

type User = Prisma.UserGetPayload<{}>;

// 状态接口
interface UserState {
  // 数据
  session: Session | null;
  user: User | null;
  clubs: Club[];
  selectedClub: Club | null;
  selectedClubId: string | null; // 用于持久化
  
  // 加载状态
  isLoadingClubs: boolean;
  isLoadingUser: boolean;
  
  // 错误状态
  clubsError: string | null;
  userError: string | null;
  
  // Actions
  setSession: (session: Session | null) => void;
  clearSession: () => void;
  setUser: (user: User | null) => void;
  setClubs: (clubs: Club[]) => void;
  setSelectedClub: (club: Club | null) => void;
  
  // 异步 Actions
  fetchClubs: () => Promise<void>;
  fetchUser: () => Promise<void>;
  
  // 辅助方法
  getClubById: (clubId: string) => Club | undefined;
  hasClub: (clubId: string) => boolean;
}

// Store 实现
export const useUserStore = create<UserState>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      session: null,
      user: null,
      clubs: [],
      selectedClub: null,
      selectedClubId: null,
      isLoadingClubs: false,
      isLoadingUser: false,
      clubsError: null,
      userError: null,
      
      // 同步 Actions
      setSession: (session) => set((state) => {
        state.session = session;
        // 如果 session 为空，清理相关数据
        if (!session) {
          state.user = null;
          state.selectedClub = null;
          state.clubs = [];
        }
      }),
      
      clearSession: () => set((state) => {
        state.session = null;
        state.user = null;
        state.selectedClub = null;
        state.selectedClubId = null;
        state.clubs = [];
        state.clubsError = null;
        state.userError = null;
      }),
      
      setUser: (user) => set((state) => {
        state.user = user;
        state.userError = null;
      }),
      
      setClubs: (clubs) => set((state) => {
        state.clubs = Array.isArray(clubs) ? clubs : [];
        state.clubsError = null;
        
        // 尝试根据selectedClubId恢复selectedClub
        if (state.selectedClubId && state.clubs.length > 0) {
          const foundClub = state.clubs.find(c => c.id === state.selectedClubId);
          if (foundClub) {
            state.selectedClub = foundClub;
          } else {
            // 如果找不到，选择第一个俱乐部
            state.selectedClub = state.clubs[0];
            state.selectedClubId = state.clubs[0]?.id || null;
          }
        } else if (!state.selectedClub && state.clubs.length > 0) {
          // 如果没有选中的俱乐部，选择第一个
          state.selectedClub = state.clubs[0];
          state.selectedClubId = state.clubs[0].id;
        } else if (state.selectedClub && state.clubs.length > 0 && !state.clubs.find(c => c.id === state.selectedClub!.id)) {
          // 如果当前选中的俱乐部不在新列表中，重置选择
          state.selectedClub = state.clubs[0];
          state.selectedClubId = state.clubs[0]?.id || null;
        }
      }),
      
      setSelectedClub: (club) => set((state) => {
        state.selectedClub = club;
        state.selectedClubId = club?.id || null;
      }),
      
      // 异步 Actions
      fetchClubs: async () => {
        set((state) => {
          state.isLoadingClubs = true;
          state.clubsError = null;
        });
        
        try {
          const response = await fetch('/api/user/get-clubs');
          if (!response.ok) {
            throw new Error('Failed to fetch clubs');
          }
          
          const data = await response.json();
          
          // 使用setClubs来处理clubs设置和selectedClub恢复
          get().setClubs(data.clubs || []);
          
          set((state) => {
            state.isLoadingClubs = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoadingClubs = false;
            state.clubsError = error instanceof Error ? error.message : 'Unknown error';
          });
        }
      },
      
      fetchUser: async () => {
        const session = get().session;
        if (!session?.user?.id) return;
        
        set((state) => {
          state.isLoadingUser = true;
          state.userError = null;
        });
        
        try {
          const response = await fetch('/api/user/profile');
          if (!response.ok) {
            throw new Error('Failed to fetch user profile');
          }
          
          const data = await response.json();
          set((state) => {
            state.user = data.user;
            state.isLoadingUser = false;
          });
        } catch (error) {
          set((state) => {
            state.isLoadingUser = false;
            state.userError = error instanceof Error ? error.message : 'Unknown error';
          });
        }
      },
      
      // 辅助方法
      getClubById: (clubId) => {
        return get().clubs.find(club => club.id === clubId);
      },
      
      hasClub: (clubId) => {
        return get().clubs.some(club => club.id === clubId);
      },
    })),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        // 只持久化选中的俱乐部ID，不持久化敏感数据
        selectedClubId: state.selectedClubId 
      }),
      onRehydrateStorage: () => (state) => {
        // 恢复时的数据处理
        if (state) {
          // 确保selectedClub被重置，等待setClubs时根据selectedClubId恢复
          state.selectedClub = null;
          
          // 如果有session，重新获取数据
          if (state.session) {
            state.fetchClubs();
            state.fetchUser();
          }
        }
      },
    }
  )
);

// 导出 hooks
export const useSelectedClub = () => useUserStore((state) => state.selectedClub);
export const useClubs = () => useUserStore((state) => state.clubs);
export const useIsLoadingClubs = () => useUserStore((state) => state.isLoadingClubs);
export const useClubsError = () => useUserStore((state) => state.clubsError);