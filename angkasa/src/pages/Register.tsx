// src/App.tsx
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  // ✅ Validasi di sisi klien (user experience lebih baik)
  if (!email) {
    setError('Email wajib diisi.');
    return;
  }

  if (!password) {
    setError('Password wajib diisi.');
    return;
  }

  if (password.length < 6) {
    setError('Password minimal 6 karakter.');
    return;
  }

  if (password !== confirmPassword) {
    setError('Password dan konfirmasi tidak cocok.');
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    setSuccess(true);
  } catch (err: any) {
    console.error('Firebase error:', err); // 👈 Lihat detail di console!

    // Tampilkan pesan error spesifik
    if (err.code === 'auth/email-already-in-use') {
      setError('Email ini sudah terdaftar.');
    } else if (err.code === 'auth/invalid-email') {
      setError('Format email tidak valid.');
    } else if (err.code === 'auth/weak-password') {
      setError('Password terlalu lemah (minimal 6 karakter).');
    } else if (err.code === 'auth/operation-not-allowed') {
      setError('Pendaftaran dinonaktifkan. Hubungi admin.');
    } else {
      setError('Gagal mendaftar. Coba lagi.');
    }
  }
};

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600">Berhasil!</h2>
          <p>Akun Anda telah dibuat. Silakan login.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Daftar Akun</h1>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <form onSubmit={handleRegister}>
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Daftar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;