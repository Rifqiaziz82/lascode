import { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { searchUsers } from '../../lib/userService';
import { Search, Send, Award, X } from 'lucide-react';

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
      alert("❌ Gagal mengirim sertifikat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Award className="text-blue-400" />
          Kirim Sertifikat Baru
        </h2>

        {/* 1. Recipient Selection */}
        <div className="mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <label className="block text-slate-400 text-sm mb-2">Pilih Penerima</label>
          
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
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSearching ? 'Mencari...' : 'Cari'}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="bg-slate-800 rounded-lg border border-slate-600 overflow-hidden max-h-48 overflow-y-auto">
                  {searchResults.map((user: { id: string; name: string; email: string }) => (
                    <button
                      key={user.id}
                      onClick={() => setRecipient(user)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-slate-700/50 border-b border-slate-700/50 last:border-0 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{user.name}</div>
                        <div className="text-slate-400 text-xs">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {recipient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-blue-200 font-medium">Kepada: {recipient.name}</div>
                  <div className="text-blue-300/60 text-sm">{recipient.email}</div>
                </div>
              </div>
              <button 
                onClick={() => setRecipient(null)}
                className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* 2. Certificate Details Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Judul Sertifikat</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Juara 1 Web Design..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Penyelenggara / Issuer</label>
              <input
                type="text"
                required
                value={formData.issuer}
                onChange={e => setFormData({...formData, issuer: e.target.value})}
                placeholder="Ex: Universitas Indonesia"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Tanggal</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Badge / Predikat</label>
              <select
                value={formData.badge}
                onChange={e => setFormData({...formData, badge: e.target.value})}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Peserta">Peserta</option>
                <option value="Finalis">Finalis</option>
                <option value="Juara 1">Juara 1</option>
                <option value="Juara 2">Juara 2</option>
                <option value="Juara 3">Juara 3</option>
                <option value="Juara Harapan">Juara Harapan</option>
                <option value="Best Speaker">Best Speaker</option>
                <option value="Best Design">Best Design</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Icon Tipe</label>
              <div className="flex bg-slate-700/50 rounded-lg p-1 border border-slate-600">
                {(['medal', 'trophy', 'star'] as const).map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({...formData, icon})}
                    className={`flex-1 py-1.5 rounded-md flex justify-center transition-colors ${
                      formData.icon === icon ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {icon === 'medal' && 'Medal'}
                    {icon === 'trophy' && 'Trophy'}
                    {icon === 'star' && 'Star'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Image URL (Optional)</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 text-sm font-medium">Deskripsi / Pesan Email</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Pesan tambahan untuk penerima..."
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
      </div>
    </div>
  );
}
