import { useState, useEffect } from 'react';
import { Users, Plus, Search, ArrowLeft, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { useAuth } from '../AuthProvider';
import {
  increment,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';



interface Community {
  id: string;
  name: string;
  description: string;
  type: 'lomba' | 'beasiswa' | 'seminar';
  members: number;
  image?: string;
  role?: string;
}

const mockCommunities: Community[] = [
  { id: '1', name: 'Pejuang Beasiswa LPDP', description: 'Komunitas diskusi persiapan beasiswa LPDP.', type: 'beasiswa', members: 1250, role: 'Admin' },
  { id: '2', name: 'Lomba Desain Grafis ID', description: 'Sharing info lomba desain terbaru.', type: 'lomba', members: 850 },
  { id: '3', name: 'Seminar Pendidikan Nasional', description: 'Info seminar pendidikan terkini.', type: 'seminar', members: 500 },
];

const mockMembers = [
  { id: 1, name: 'Budi Santoso', role: 'Owner' },
  { id: 2, name: 'Siti Aminah', role: 'Admin' },
  { id: 3, name: 'Rudi Hartono', role: 'Member' },
  { id: 4, name: 'Dewi Lestari', role: 'Member' },
];


export default function CommunityView() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'menu' | 'create' | 'join' | 'detail'>('menu');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'lomba' | 'beasiswa' | 'seminar'>('lomba');
  const [members, setMembers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const q = query(collection(db, 'communities'));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          members: doc.data().members_count || 0,
        })) as Community[];
        setCommunities(list);
      } catch (err) {
        console.error('Gagal muat komunitas:', err);
      } finally {
        setLoading(false);
      }
    };

    if (viewMode === 'join') {
      loadCommunities();
    }
  }, [viewMode]);


  const loadMembers = async (communityId: string) => {
    setLoadingMembers(true);
    try {
      // 1. Ambil semua membership
      const membershipQuery = query(
        collection(db, 'memberships'),
        where('community_id', '==', communityId)
      );
      const membershipSnapshot = await getDocs(membershipQuery);
      const memberIds = membershipSnapshot.docs.map(doc => doc.data().user_id);

      if (memberIds.length === 0) {
        setMembers([]);
        setLoadingMembers(false);
        return;
      }

      // 2. Ambil data user berdasarkan document ID (UID)
      const userDocs = await Promise.all(
        memberIds.map(uid => getDoc(doc(db, 'users', uid)))
      );

      // 3. Bangun daftar anggota
      const memberList = membershipSnapshot.docs.map((_, index) => {
        const mData = membershipSnapshot.docs[index].data();
        const userDoc = userDocs[index];
        const userData = userDoc?.exists() ? userDoc.data() : null;

        return {
          id: mData.user_id,
          name: userData?.name || 'User',
          role: mData.role || 'member',
        };
      });

      setMembers(memberList);
    } catch (err) {
      console.error('Gagal muat anggota:', err);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };



  const handleCreateCommunity = async () => {
    if (!user) {
      alert('Anda harus login terlebih dahulu.');
      return;
    }
    //   // Ambil nilai dari form (gunakan state atau ref)
    //   const name = "Nama dari input"; // ✅ ganti dengan state
    //   const description = "Deskripsi dari input";
    //   const type = "lomba"; // ✅ ambil dari select

    if (!name || !description || !type) {
      alert('Semua field wajib diisi');
      return;
    }

    if (!name.trim() || !description.trim()) {
      alert('Nama dan deskripsi wajib diisi.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'communities'), {
        name: name.trim(),
        description: description.trim(),
        type,
        members_count: 1,
        created_by: user.id, // ✅ sekarang user sudah didefinisikan
        created_at: serverTimestamp(),
      });

      // Otomatis jadi owner
      await addDoc(collection(db, 'memberships'), {
        community_id: docRef.id,
        user_id: user.id,
        role: 'owner',
        joined_at: serverTimestamp(),
      });

      alert('Komunitas berhasil dibuat!');
      setViewMode('menu');
    } catch (err) {
      console.error('Gagal buat komunitas:', err);
      alert('Gagal membuat komunitas.');
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      // Tambahkan ke memberships
      await addDoc(collection(db, 'memberships'), {
        community_id: communityId,
        user_id: user.id,
        role: 'member',
        joined_at: serverTimestamp(),
      });

      // Update members_count
      const communityRef = doc(db, 'communities', communityId);
      await updateDoc(communityRef, {
        members_count: increment(1),
      });

      alert('Berhasil gabung komunitas!');
      // Bisa redirect ke halaman forum komunitas
    } catch (err) {
      console.error('Gagal gabung:', err);
      alert('Gagal gabung komunitas.');
    }
  };

  const handleCommunityClick = async (community: Community) => {
    setSelectedCommunity(community);
    setViewMode('detail');

    // ✅ Muat anggota
    await loadMembers(community.id);
  };

  const renderMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button
        onClick={() => setViewMode('create')}
        className="flex flex-col items-center justify-center p-8 bg-slate-800/30 border border-slate-600/30 rounded-xl hover:bg-slate-700/40 transition-all group"
      >
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Plus className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">Buat Komunitas</h3>
        <p className="text-slate-400 text-center">Bangun komunitasmu sendiri dan ajak orang lain bergabung.</p>
      </button>

      <button
        onClick={() => setViewMode('join')}
        className="flex flex-col items-center justify-center p-8 bg-slate-800/30 border border-slate-600/30 rounded-xl hover:bg-slate-700/40 transition-all group"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Users className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">Gabung Komunitas</h3>
        <p className="text-slate-400 text-center">Temukan komunitas yang sesuai dengan minatmu.</p>
      </button>
    </div>
  );

  const renderCreateForm = () => (
    <div className="max-w-2xl mx-auto bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
      <button onClick={() => setViewMode('menu')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>
      <h2 className="text-2xl font-bold text-slate-200 mb-6">Buat Komunitas Baru</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nama Komunitas</label>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full px-4 py-2 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Contoh: Pejuang Beasiswa" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500" rows={4} placeholder="Jelaskan tentang komunitas ini..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Tipe Forum</label>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-2 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="lomba">Lomba</option>
            <option value="beasiswa">Beasiswa</option>
            <option value="seminar">Seminar</option>
          </select>
        </div>
        <div className="pt-4">
          <button onClick={handleCreateCommunity} type="button" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
            Buat Komunitas
          </button>
        </div>
      </form>
    </div>
  );

  const renderJoinList = () => {
    // Filter communities based on search query
    const filteredCommunities = communities.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'lomba': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        case 'beasiswa': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        case 'seminar': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        default: return 'bg-slate-700/50 text-slate-400 border-slate-600/30';
      }
    };

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setViewMode('menu')}
              className="p-2.5 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-600/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">Jelajahi Komunitas</h2>
              <p className="text-slate-400 text-sm">Temukan tempat untuk berkembang bersama</p>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari komunitas impianmu..."
              className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Grid Section */}
        {filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <div
                key={community.id}
                onClick={() => handleCommunityClick(community)}
                className="group relative bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5"
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />

                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                      {community.image ? (
                        <img src={community.image} alt={community.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <Users className="w-7 h-7 text-slate-400 group-hover:text-blue-400 transition-colors" />
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(community.type)}`}>
                      {community.type.charAt(0).toUpperCase() + community.type.slice(1)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {community.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10 leading-relaxed">
                    {community.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <User className="w-4 h-4" />
                      <span>{community.members} Anggota</span>
                    </div>
                    <span className="text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all flex items-center gap-1">
                      Gabung <ArrowLeft className="w-4 h-4 rotate-180" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">Tidak ada komunitas ditemukan</h3>
            <p className="text-slate-500 max-w-md">
              Kami tidak dapat menemukan komunitas dengan kata kunci "{searchQuery}". Coba gunakan kata kunci lain.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderDetail = () => {
    if (!selectedCommunity) return null;
    return (
      <div className="space-y-6">
        <button onClick={() => setViewMode('join')} className="flex items-center gap-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
        </button>

        <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-200 mb-2">{selectedCommunity.name}</h2>
              <p className="text-slate-400 mb-4">{selectedCommunity.description}</p>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full font-medium uppercase">
                  {selectedCommunity.type}
                </span>
                <span className="text-slate-500 text-sm">{selectedCommunity.members} Anggota</span>
              </div>
            </div>
            {user ? (
              <button
                onClick={() => selectedCommunity && handleJoinCommunity(selectedCommunity.id)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                Gabung
              </button>
            ) : (
              <button
                onClick={() => navigate('/login', { state: { message: 'Login untuk gabung komunitas' } })}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                Login untuk Gabung
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-600/30">
            <h3 className="font-semibold text-slate-200">Anggota Komunitas</h3>
          </div>
          <div className="divide-y divide-slate-700/50">
            {loadingMembers ? (
              <div className="p-4 text-slate-500 text-sm">Memuat anggota...</div>
            ) : members.length > 0 ? (
              members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => navigate(`/user/${member.id}`)}
                  className="p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <span className="font-medium text-slate-300">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{member.name}</p>
                      <p className="text-xs text-slate-500">Online 1 jam lalu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === 'owner' && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Owner
                      </span>
                    )}
                    {member.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-slate-500 text-sm">Belum ada anggota.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {viewMode === 'menu' && renderMenu()}
      {viewMode === 'create' && renderCreateForm()}
      {viewMode === 'join' && renderJoinList()}
      {viewMode === 'detail' && renderDetail()}
    </div>
  );
}