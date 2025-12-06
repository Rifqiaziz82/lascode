import React from 'react';
import { List, Bell } from 'lucide-react';

const AdminPanel: React.FC<{ userId: string }> = ({ userId }) => (
  <div className="space-y-8">
    <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl shadow-2xl text-center">
      <h1 className="text-4xl font-extrabold text-white mb-2">Selamat Datang, Sobat!</h1>
      <p className="text-xl text-gray-200">Dashboard Admin LasCode</p>
    </div>
    <div className="bg-gray-900 border border-slate-700 p-6 rounded-xl shadow-xl space-y-4">
      <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">Informasi Akun</h2>
      <p className="text-gray-400">Anda masuk sebagai Admin.</p>
      <div className="bg-gray-700 p-3 rounded-lg text-sm font-mono break-all">
        <span className="text-blue-200">User ID:</span> <span className="text-yellow-300">{userId}</span>
      </div>
      <p className="text-sm text-gray-500 italic">ID ini penting untuk identifikasi data publik dan private.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg hover:shadow-blue-700/50 transition">
        <List size={32} className="text-blue-400 mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">Kelola Postingan</h3>
        <p className="text-gray-400">Tambahkan, edit, atau hapus Postingan Lomba untuk peserta.</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg hover:shadow-blue-700/50 transition">
        <Bell size={32} className="text-blue-400 mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">Kirim Notifikasi</h3>
        <p className="text-gray-400">Kirim pesan penting kepada semua peserta lomba.</p>
      </div>
    </div>
  </div>
);

export default AdminPanel;
