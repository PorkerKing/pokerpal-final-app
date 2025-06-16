import { create } from 'zustand';
import { Prisma } from '@prisma/client';
import type { Session } from 'next-auth';

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

interface UserState {
  session: Session | null;
  user: User | null;
  clubs: Club[];
  selectedClub: Club | null;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
  setUser: (user: User | null) => void;
  setClubs: (clubs: Club[]) => void;
  setSelectedClub: (club: Club) => void;
}

export const useUserStore = create<UserState>((set) => ({
  session: null,
  user: null,
  clubs: [],
  selectedClub: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null, user: null, selectedClub: null, clubs: [] }),
  setUser: (user) => set({ user }),
  setClubs: (clubs) => set({ clubs }),
  setSelectedClub: (club) => set({ selectedClub: club }),
})); 