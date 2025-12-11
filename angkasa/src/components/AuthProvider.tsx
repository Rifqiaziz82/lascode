// src/components/AuthProvider.tsx
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // ✅ tambahkan ini
import { auth, db } from '../firebase'; // ✅ pastikan `db` ada
import { authService } from '../auth';

// 🔹 Tipe user: `id` = Firebase UID (unik & aman)
type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  bio?: string;
  role?: string;
  experience_level?: string;
  favorite_artists?: string[];
  favorite_genre?: string;
  software_used?: string;
  city_region?: string;
  availability?: string;
  tags?: string[];
  social_media?: {
      instagram?: string;
      youtube?: string;
      tiktok?: string;
  };
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

  // 🔊 Audio (tetap dipertahankan)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/soundtrack1.mp3');
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

  // 🔑 Sinkronisasi dengan Firebase Auth + Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // ✅ Ambil data dari Firestore berdasarkan uid
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          let userData: User;

          if (userDoc.exists()) {
            const data = userDoc.data();
            userData = {
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: data.email || firebaseUser.email || '',
              emailVerified: firebaseUser.emailVerified,
              bio: data.bio || undefined,
              role: data.role,
              experience_level: data.experience_level,
              favorite_artists: data.favorite_artists,
              favorite_genre: data.favorite_genre,
              software_used: data.software_used,
              city_region: data.city_region,
              availability: data.availability,
              tags: data.tags,
              social_media: data.social_media
            };
          } else {
            // ✅ Buat profil default di Firestore jika belum ada
            const defaultName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
            const defaultEmail = firebaseUser.email || '';

            await setDoc(userDocRef, {
              name: defaultName,
              email: defaultEmail,
              bio: '',
              createdAt: new Date().toISOString(),
            });

            userData = {
              id: firebaseUser.uid,
              name: defaultName,
              email: defaultEmail,
              emailVerified: firebaseUser.emailVerified,
              bio: undefined,
            };
          }

          setUser(userData);
          setIsEmailVerified(firebaseUser.emailVerified);
          playAudio(); // 🔊 play saat login
        } catch (error) {
          console.error('Gagal memuat profil:', error);
          // Fallback ke data minimal
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            emailVerified: firebaseUser.emailVerified,
            bio: undefined,
          });
        }
      } else {
        setUser(null);
        setIsEmailVerified(false);
        pauseAudio(); // 🔊 pause saat logout
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ Login
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

  // ✅ Update profil (simpan ke Firestore)
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    const updatedData = { ...updates };
    const userDocRef = doc(db, 'users', user.id);

    await setDoc(userDocRef, updatedData, { merge: true });

    // Perbarui state lokal
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
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