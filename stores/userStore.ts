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
  clubId: string | null;
  aiPersonaName: string | null;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
  setUser: (user: User | null) => void;
  setClubs: (clubs: Club[]) => void;
  setClub: (clubId: string, clubName: string, aiPersonaName: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  session: null,
  user: null,
  clubs: [],
  selectedClub: null,
  clubId: null,
  aiPersonaName: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null, user: null, selectedClub: null, clubs: [] }),
  setUser: (user) => set({ user }),
  setClubs: (clubs) => set({ clubs }),
  setClub: (clubId, clubName, aiPersonaName) => set(state => {
    const club = state.clubs.find(c => c.id === clubId) || { id: clubId, name: clubName, aiPersona: { name: aiPersonaName }};
    return { selectedClub: club, clubId, aiPersonaName };
  }),
})); 