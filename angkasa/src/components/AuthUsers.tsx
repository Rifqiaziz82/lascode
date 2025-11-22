// src/components/AuthUsers.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';
import { authService } from '../auth';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthUsersContext = createContext<AuthContextType | null>(null);

// 👇 GANTI INI: useAuth → useAuthUsers
export function useAuthUsers() {
  const context = useContext(AuthUsersContext);
  if (!context) {
    throw new Error('useAuthUsers must be used within AuthUsersProvider');
  }
  return context;
}

// 👇 GANTI INI: AuthProvider → AuthUsersProvider
export function AuthUsersProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const register = async (email: string, password: string) => {
    await authService.register(email, password);
  };

  const loginWithGoogle = async () => {
    await authService.loginWithGoogle();
  };

  const logout = async () => {
    await authService.logout();
  };

  return (
    <AuthUsersContext.Provider
      value={{ user, login, register, loginWithGoogle, logout, loading }}
    >
      {children}
    </AuthUsersContext.Provider>
  );
}