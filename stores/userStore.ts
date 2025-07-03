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
}>;

type User = Prisma.UserGetPayload<{}>;

// 状态接口
interface UserState {
  // 数据
  session: Session | null;
  user: User | null;
  clubs: Club[];
  selectedClub: Club | null;
  
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
        state.clubs = [];
        state.clubsError = null;
        state.userError = null;
      }),
      
      setUser: (user) => set((state) => {
        state.user = user;
        state.userError = null;
      }),
      
      setClubs: (clubs) => set((state) => {
        state.clubs = clubs;
        state.clubsError = null;
        
        // 如果当前选中的俱乐部不在新列表中，重置选择
        if (state.selectedClub && !clubs.find(c => c.id === state.selectedClub!.id)) {
          state.selectedClub = clubs.length > 0 ? clubs[0] : null;
        }
      }),
      
      setSelectedClub: (club) => set((state) => {
        state.selectedClub = club;
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
          set((state) => {
            state.clubs = data.clubs || [];
            state.isLoadingClubs = false;
            
            // 自动选择第一个俱乐部
            if (!state.selectedClub && state.clubs.length > 0) {
              state.selectedClub = state.clubs[0];
            }
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
        selectedClubId: state.selectedClub?.id 
      }),
      onRehydrateStorage: () => (state) => {
        // 恢复时重新获取数据
        if (state?.session) {
          state.fetchClubs();
          state.fetchUser();
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