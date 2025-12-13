import { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { searchUsers } from '../../lib/userService';
import { Search, Send, Award, X } from 'lucide-react';

import { InputField, GlassCard } from './AdminCommon';

export default function AdminCertificate() {
  const [recipient, setRecipient] = useState<{ id: string; name: string; email: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    date: new Date().toISOString().split('T')[0],
    badge: 'Peserta',
    icon: 'medal' as 'trophy' | 'medal' | 'star',
    description: '',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      alert("Gagal mencari user");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      alert("Pilih penerima sertifikat terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Email/Notification Document
      await addDoc(collection(db, 'emails'), {
        recipientId: recipient.id,
        recipientName: recipient.name,
        subject: `Sertifikat: ${formData.title}`,
        senderName: formData.issuer || 'Angkasa Team',
        preview: `Selamat! Anda telah menerima sertifikat ${formData.badge} untuk ${formData.title}`,
        content: formData.description || `Berikut adalah sertifikat elektronik untuk ${formData.title} yang diselenggarakan oleh ${formData.issuer}.`,
        time: serverTimestamp(), // Use server timestamp
        dateString: new Date().toLocaleDateString('id-ID'), // For display backup
        read: false,
        starred: false,
        type: 'certificate',
        // Certificate Specific Data (embedded for easier access)
        certificate: {
          title: formData.title,
          issuer: formData.issuer,
          date: formData.date,
          badge: formData.badge,
          icon: formData.icon,
          imageUrl: formData.imageUrl || null,
        },
        attachments: 1
      });

      alert(`✅ Sertifikat berhasil dikirim ke ${recipient.name}!`);

      // Reset form
      setFormData({
        title: '',
        issuer: '',
        date: new Date().toISOString().split('T')[0],
        badge: 'Peserta',
        icon: 'medal',
        description: '',
        imageUrl: '',
      });
      setRecipient(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error("Error sending certificate:", error);
      alert("Gagal mengirim sertifikat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-300">
      <GlassCard>
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Kirim Sertifikat
          </h2>
        </div>

        {/* 1. Recipient Selection */}
        <div className="mb-6 md:mb-8 p-4 bg-slate-900/40 rounded-xl border border-white/5 backdrop-blur-sm">
          <label className="block text-slate-300 text-sm font-semibold mb-3">Pilih Penerima</label>

          {!recipient ? (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari user by nama..."
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-blue-600/20"
                >
                  {isSearching ? '...' : 'Cari'}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="bg-slate-800/80 rounded-xl border border-white/10 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar backdrop-blur-md">
                  {searchResults.map((user: { id: string; name: string; email: string }) => (
                    <button
                      key={user.id}
                      onClick={() => setRecipient(user)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-medium text-sm truncate">{user.name}</div>
                        <div className="text-slate-400 text-xs truncate">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
                  {recipient.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-blue-200 font-bold truncate">Kepada: {recipient.name}</div>
                  <div className="text-blue-300/60 text-sm truncate">{recipient.email}</div>
                </div>
              </div>
              <button
                onClick={() => setRecipient(null)}
                className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-300 transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* 2. Certificate Details Form */}
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputField
              id="title" label="Judul Sertifikat" type="text"
              value={formData.title} onChange={v => setFormData(p => ({ ...p, title: v }))}
              placeholder="Ex: Juara 1 Web Design..."
            />
            <InputField
              id="issuer" label="Penyelenggara / Issuer" type="text"
              value={formData.issuer} onChange={v => setFormData(p => ({ ...p, issuer: v }))}
              placeholder="Ex: Universitas Indonesia"
            />
            <InputField
              id="date" label="Tanggal" type="date"
              value={formData.date} onChange={v => setFormData(p => ({ ...p, date: v }))}
            />
            <InputField
              id="badge" label="Badge / Predikat" type="select"
              value={formData.badge} onChange={v => setFormData(p => ({ ...p, badge: v }))}
              options={[
                { value: "Peserta", label: "Peserta" },
                { value: "Finalis", label: "Finalis" },
                { value: "Juara 1", label: "Juara 1" },
                { value: "Juara 2", label: "Juara 2" },
                { value: "Juara 3", label: "Juara 3" },
                { value: "Juara Harapan", label: "Juara Harapan" },
                { value: "Best Speaker", label: "Best Speaker" },
                { value: "Best Design", label: "Best Design" },
              ]}
            />
            <div className="space-y-2">
              <label className="text-slate-300 text-xs md:text-sm font-semibold">Icon Tipe</label>
              <div className="flex bg-slate-800/50 rounded-xl p-1 border border-white/5">
                {(['medal', 'trophy', 'star'] as const).map((icon) => (
                  <button
                    key={icon} type="button" onClick={() => setFormData({ ...formData, icon })}
                    className={`flex-1 py-3 text-sm rounded-lg flex justify-center items-center gap-2 transition-all duration-200 font-medium ${formData.icon === icon ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {icon === 'medal' && 'Medal'} {icon === 'trophy' && 'Trophy'} {icon === 'star' && 'Star'}
                  </button>
                ))}
              </div>
            </div>
            <InputField
              id="imageUrl" label="Image URL (Optional)" type="url"
              value={formData.imageUrl} onChange={v => setFormData(p => ({ ...p, imageUrl: v }))}
              placeholder="https://..." required={false}
            />
          </div>

          <InputField
            id="desc" label="Deskripsi / Pesan Email" type="textarea"
            value={formData.description} onChange={v => setFormData(p => ({ ...p, description: v }))}
            placeholder="Pesan tambahan untuk penerima..." required={false}
          />

          <div className="flex justify-end pt-6 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100"
            >
              {loading ? (
                <>Loading...</>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kirim Sertifikat
                </>
              )}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
