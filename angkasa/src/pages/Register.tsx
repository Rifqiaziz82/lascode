// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, getDoc, getCountFromServer } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // ✅ tambahkan username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Fungsi cek keunikan username
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

    // Validasi dasar
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

    // ✅ Validasi format username
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
      // ✅ 0. Cek Pengaturan Pendaftaran (Global Kill Switch & Limit)
      const settingsSnap = await getDoc(doc(db, 'settings', 'registration'));
      if (settingsSnap.exists()) {
          const { allowRegistration, maxUsers } = settingsSnap.data();
          if (!allowRegistration) {
              setError('Pendaftaran sedang ditutup oleh admin.');
              setLoading(false);
              return;
          }
          
          // Cek jumlah user jika ada limit
          if (maxUsers) {
              const usersSnap = await getCountFromServer(collection(db, 'users'));
              if (usersSnap.data().count >= maxUsers) {
                  setError('Kuota pendaftaran penuh.');
                  setLoading(false);
                  return;
              }
          }
      }

      // ✅ Cek keunikan username
      const available = await isUsernameAvailable(cleanUsername);
      if (!available) {
        setError('Nama panggilan sudah dipakai. Coba yang lain.');
        setLoading(false);
        return;
      }

      // 1. Buat akun di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // 2. Simpan ke Firestore — termasuk username!
      await setDoc(doc(db, 'users', uid), {
        name: name.trim(),
        username: cleanUsername, // ✅ simpan username
        email: email.toLowerCase().trim(),
        bio: '',
        createdAt: new Date().toISOString(),
      });

      // 3. Redirect ke login
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Buat Akun Baru</h1>

        {error && <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* ✅ Input Username Baru */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nama Panggilan (username)
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="contoh: budi_aja"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Hanya huruf, angka, dan _ (minimal 3 karakter)
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Konfirmasi Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md font-medium text-white ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } transition`}
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}