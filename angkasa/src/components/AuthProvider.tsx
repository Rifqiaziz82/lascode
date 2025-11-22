// src/components/AuthProvider.tsx
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';
import { authService } from '../auth';

// 🔊 Tambahkan tipe user yang sesuai dengan Firebase
type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  bio?: string;
};

type AuthContextType = {
  user: User | null;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loading: boolean;
  // 🔊 Audio API
  isAudioPlaying: boolean;
  playAudio: () => void;
  pauseAudio: () => void;
  togglePlay: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔊 Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // 🔊 Inisialisasi audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/soundtrack.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
      return () => audio.pause();
    }
  }, []);

  const playAudio = () => {
    const audio = audioRef.current;
    if (audio?.paused) {
      audio.play().then(() => setIsAudioPlaying(true)).catch(console.warn);
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      setIsAudioPlaying(false);
    }
  };

  const togglePlay = () => {
    isAudioPlaying ? pauseAudio() : playAudio();
  };

  // 🔑 Sinkronisasi dengan Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(userData);
        setIsEmailVerified(firebaseUser.emailVerified);
        playAudio(); // 🔊 play saat login berhasil
      } else {
        setUser(null);
        setIsEmailVerified(false);
        pauseAudio(); // 🔊 pause saat logout
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ✅ Firebase login
  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const loginWithGoogle = async () => {
    await authService.loginWithGoogle();
  };

  const logout = async () => {
    await authService.logout();
  };

  const sendVerificationEmail = async () => {
    await authService.sendVerificationEmail();
  };

  const updateProfile = async (updates: Partial<User>) => {
    // Implementasi update profile via Firebase bisa ditambahkan nanti
    console.log('Update profile:', updates);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isEmailVerified,
        login,
        loginWithGoogle,
        logout,
        sendVerificationEmail,
        updateProfile,
        loading,
        isAudioPlaying,
        playAudio,
        pauseAudio,
        togglePlay,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}