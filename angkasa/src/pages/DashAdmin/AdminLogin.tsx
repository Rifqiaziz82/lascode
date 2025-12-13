import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, rtdb } from '../../firebase';
import { InputField, GlassCard } from './AdminCommon';
import { User, Mail, Lock, UserPlus, LogIn, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user is admin in Realtime Database
        const adminRef = ref(rtdb, `admins/${user.uid}`);
        const snapshot = await get(adminRef);

        if (!snapshot.exists()) {
          throw new Error('Akun ini bukan admin');
        }

        onLoginSuccess();
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        if (name) {
          await updateProfile(user, { displayName: name });
        }

        // Save admin data to Realtime Database
        const adminData = {
          uid: user.uid,
          email: user.email,
          name: name || user.email?.split('@')[0] || 'Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        await set(ref(rtdb, `admins/${user.uid}`), adminData);

        onLoginSuccess();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = 'Terjadi kesalahan';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email atau password salah';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password salah';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah terdaftar';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden font-sans">
      <style>{`
        @keyframes moveStars {
          from { background-position: 0 0; }
          to { background-position: 1000px 500px; }
        }
      `}</style>

      {/* Lightweight Animated Star Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, #eee 100%, transparent),
            radial-gradient(1px 1px at 100px 150px, #eee 100%, transparent),
            radial-gradient(1px 1px at 200px 50px, #eee 100%, transparent),
            radial-gradient(1px 1px at 300px 200px, #eee 100%, transparent),
            radial-gradient(1px 1px at 450px 120px, #eee 100%, transparent),
            radial-gradient(2px 2px at 550px 300px, #fff 100%, transparent),
            radial-gradient(1px 1px at 600px 50px, #eee 100%, transparent),
            radial-gradient(1px 1px at 700px 150px, #eee 100%, transparent),
            radial-gradient(2px 2px at 800px 250px, #fff 100%, transparent)
          `,
          backgroundSize: '1000px 1000px',
          animation: 'moveStars 100s linear infinite',
        }}
      />

      <GlassCard className="w-full max-w-md p-8 shadow-2xl relative z-10 border-white/10 !bg-slate-900/60 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30 transform rotate-3">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {isLogin ? 'Login' : 'Daftar'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Masuk sebagai admin provider' : 'Daftarkan diri Anda sebagai admin baru'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <InputField
              id="name"
              label="Nama Lengkap"
              type="text"
              value={name}
              onChange={setName}
              Icon={User}
              placeholder="Nama lengkap Anda"
            />
          )}

          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            Icon={Mail}
            placeholder="admin@angkasa.id"
          />

          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            Icon={Lock}
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password || (!isLogin && !name)}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center shadow-lg active:scale-95 ${loading
              ? 'bg-slate-700 cursor-not-allowed text-slate-400'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/25'
              }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                {isLogin ? (
                  <>
                    <LogIn className="mr-2" size={20} />
                    Masuk
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2" size={20} />
                    Daftar
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/5">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            {isLogin ? (
              <>Belum punya akun? <span className="text-blue-400 hover:text-blue-300 ml-1">Daftar sekarang</span></>
            ) : (
              <>Sudah punya akun? <span className="text-blue-400 hover:text-blue-300 ml-1">Masuk sekarang</span></>
            )}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminLogin;