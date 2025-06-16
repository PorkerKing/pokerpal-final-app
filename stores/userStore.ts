import { create } from 'zustand';
import { Club, User } from '@prisma/client';
import { Session } from 'next-auth';

type ClubWithPersona = Club & { aiPersona: { name: string } | null };

interface UserState {
  user: (User & { id: string }) | null;
  clubs: ClubWithPersona[];
  selectedClub: ClubWithPersona | null;
  setSession: (session: Session | null, userClubs: ClubWithPersona[]) => void;
  setSelectedClub: (clubId: string) => void;
  clearSession: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  clubs: [],
  selectedClub: null,
  setSession: (session, userClubs) => {
    if (session?.user) {
      set({
        user: session.user as User & { id: string },
        clubs: userClubs,
        selectedClub: userClubs[0] || null,
      });
    }
  },
  setSelectedClub: (clubId: string) => {
    const clubToSelect = get().clubs.find(c => c.id === clubId);
    if (clubToSelect) {
      set({ selectedClub: clubToSelect });
    }
  },
  clearSession: () => set({ user: null, clubs: [], selectedClub: null }),
})); 