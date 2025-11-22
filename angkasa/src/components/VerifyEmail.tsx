// src/pages/VerifyEmailPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmailPage() {
  const { user, isEmailVerified, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (isEmailVerified) {
      navigate('/dashboard');
    }
  }, [isEmailVerified, navigate]);

  const handleSendVerification = async () => {
    setSending(true);
    try {
      await sendVerificationEmail();
      // Reset countdown setelah sukses kirim
      setCountdown(60);
    } catch (err) {
      alert('Gagal mengirim email verifikasi');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !sending) {
      timer = setTimeout(() => setCountdown(c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, sending]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 shadow-2xl">
        <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Verifikasi Email</h1>
        <p className="text-slate-300 mb-6">
          Kami telah mengirimkan link verifikasi ke <span className="font-mono bg-slate-800/50 px-2 py-1 rounded">{user?.email}</span>.
          Silakan cek inbox (dan folder spam) Anda.
        </p>

        <button
          onClick={handleSendVerification}
          disabled={sending || countdown > 0}
          className={`w-full py-3 px-4 rounded-lg font-medium transition ${
            sending || countdown > 0
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          {sending ? 'Mengirim...' : countdown > 0 ? `Kirim Ulang (${countdown}s)` : 'Kirim Ulang Verifikasi'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm text-slate-400 hover:text-white underline"
        >
          Kembali ke beranda
        </button>
      </div>
    </div>
  );
}