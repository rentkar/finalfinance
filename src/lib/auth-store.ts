import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'director' | 'finance' | null;

interface AuthStore {
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  canApprove: (approvalType: 'director' | 'finance') => boolean;
}

const VALID_USERS = [
  { username: 'director', password: '1234', role: 'director' as const },
  { username: 'finance', password: '1234', role: 'finance' as const }
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userRole: null,

      login: async (username, password) => {
        const user = VALID_USERS.find(
          u => u.username === username.toLowerCase() && u.password === password
        );

        if (user) {
          set({ isAuthenticated: true, userRole: user.role });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false, userRole: null });
      },

      canApprove: (approvalType) => {
        const { userRole } = get();
        return userRole === approvalType;
      },
    }),
    {
      name: 'auth-store',
      storage: sessionStorage,
    }
  )
);