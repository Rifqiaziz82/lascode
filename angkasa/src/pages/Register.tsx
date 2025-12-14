// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  getCountFromServer,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';
import Particles from '../components/Particles';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isUsernameAvailable = async (uname: string): Promise<boolean> => {
    if (uname.length < 3 || uname.length > 20) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(uname)) return false;

    const q = query(collection(db, 'users'), where('username', '==', uname));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name.trim()) {
      setError('Nama wajib diisi.');
      setLoading(false);
      return;
    }

    if (!username.trim()) {
      setError('Nama panggilan wajib diisi.');
      setLoading(false);
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setError('Nama panggilan harus 3–20 karakter, hanya huruf, angka, atau _');
      setLoading(false);
      return;
    }

    if (!email) {
      setError('Email wajib diisi.');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Password wajib diisi.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      // ✅ Cek pengaturan pendaftaran (kill switch & limit)
      const settingsSnap = await getDoc(doc(db, 'settings', 'registration'));
      if (settingsSnap.exists()) {
        const { allowRegistration, maxUsers } = settingsSnap.data();
        if (!allowRegistration) {
          setError('Pendaftaran sedang ditutup oleh admin.');
          setLoading(false);
          return;
        }

        if (maxUsers) {
          const usersSnap = await getCountFromServer(collection(db, 'users'));
          if (usersSnap.data().count >= maxUsers) {
            setError('Kuota pendaftaran penuh.');
            setLoading(false);
            return;
          }
        }
      }

      const available = await isUsernameAvailable(cleanUsername);
      if (!available) {
        setError('Nama panggilan sudah dipakai. Coba yang lain.');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      await setDoc(doc(db, 'users', uid), {
        name: name.trim(),
        username: cleanUsername,
        email: email.toLowerCase().trim(),
        bio: '',
        createdAt: new Date().toISOString(),
      });

      navigate('/login', {
        state: { message: 'Akun berhasil dibuat! Silakan login.' },
      });
    } catch (err: any) {
      console.error('Register error:', err);

      if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu lemah.');
      } else {
        setError('Gagal mendaftar. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          particleCount={120}
          particleSpread={6}
          speed={0.07}
          particleColors={['#e2e8f0']}
          moveParticlesOnHover={true}
          alphaParticles={true}
          particleBaseSize={50}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden p-8 border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Daftar</h2>
            <p className="text-gray-600 mt-2">Buat akun baru untuk bergabung</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md text-sm text-red-700 bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                autoFocus // ✅ fokus otomatis
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Panggilan (username)
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: budi_aja"
                className="w-full px-4 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Hanya huruf, angka, dan _ (3–20 karakter)
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-600 hover:bg-slate-700'
              } transition duration-200`}
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-slate-600 hover:underline font-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}