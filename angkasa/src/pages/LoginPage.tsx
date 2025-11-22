// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider'; // pastikan pakai AuthProvider
import { useNavigate } from 'react-router-dom';
import Particles from '../components/Particles';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, user } = useAuth(); // 👈 tambahkan `user`
  const navigate = useNavigate();

  // 🔁 Redirect ke /forum jika user sudah login
  useEffect(() => {
    if (user) {
      navigate('/forum');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // ❌ JANGAN redirect di sini → biarkan useEffect yang handle
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan Google');
    } finally {
      setLoading(false);
    }
  };

  // Opsional: hindari render form jika sedang loading auth
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Login</h2>
            <p className="text-gray-600 mt-2">Masuk ke akun Anda</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-600 hover:bg-slate-700'
              } transition duration-200`}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">atau</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } transition`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="#fff"
                d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
              />
            </svg>
            Login dengan Google
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link to="/daftar" className="text-slate-600 hover:underline font-medium">
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}