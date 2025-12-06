import React, { useState } from 'react';
import { Bell, BookOpen, Clock, Send } from 'lucide-react';
import { InputField } from './AdminCommon';

const AdminNotif: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setIsSending(true);
    setStatus(null);

    setTimeout(() => {
      setIsSending(false);
      setStatus('Notifikasi berhasil dikirim!');
      setIsSuccess(true);
      console.log('Simulated notification:', { title, message, timestamp: new Date() });
      setTitle('');
      setMessage('');
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-white-300 border-b border-slate-700 pb-3">
        Kirim Notifikasi ke Peserta
      </h1>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField id="notifTitle" label="Judul Pesan" type="text" value={title} onChange={setTitle} Icon={Bell} />
          <InputField id="notifMessage" label="Isi Pesan" type="textarea" value={message} onChange={setMessage} Icon={BookOpen} />
          {status && (
            <div
              className={`p-3 rounded-lg text-sm ${
                isSuccess ? 'bg-green-800 text-green-200 border border-green-600' : 'bg-red-800 text-red-200 border border-red-600'
              }`}
            >
              {status}
            </div>
          )}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSending || !title || !message}
              className={`px-6 py-2 flex items-center justify-center font-bold rounded-lg transition ${
                isSending
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-700 text-white hover:bg-blue-500 shadow-md shadow-blue-800/50'
              }`}
            >
              {isSending ? (
                <>
                  <Clock size={18} className="animate-spin mr-2" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Kirim Notifikasi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNotif;
