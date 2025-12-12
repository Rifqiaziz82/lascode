// src/components/admin/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import { List, Bell, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../firebase';

interface AdminPanelProps {
  userId: string;
  user?: {
    displayName?: string | null;
    email?: string | null;
  };
  onNavigate?: (route: 'posts' | 'notifications') => void;
}

interface DashboardStats {
  totalPosts: number;
  lombaCount: number;
  beasiswaCount: number;
  upcomingDeadlines: any[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ userId, user, onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    lombaCount: 0,
    beasiswaCount: 0,
    upcomingDeadlines: [],
  });
  const [loading, setLoading] = useState(true);

  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      try {
        const snapshot = await get(ref(rtdb, `admins/${userId}/posts`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const posts = Object.values(data) as any[];

          const now = new Date();
          const upcoming = posts
            .map(p => ({ ...p, closingDateObj: new Date(p.closingDate) }))
            .filter(p => p.closingDateObj > now)
            .sort((a, b) => a.closingDateObj.getTime() - b.closingDateObj.getTime())
            .slice(0, 3);

          setStats({
            totalPosts: posts.length,
            lombaCount: posts.filter(p => p.type === 'lomba').length,
            beasiswaCount: posts.filter(p => p.type === 'beasiswa').length,
            upcomingDeadlines: upcoming,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const displayName = getDisplayName();

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gray-800 border border-slate-700 p-6 md:p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Halo, <span className="text-blue-400">{displayName}</span>!
          </h1>
          <div className="space-y-3">
            <p className="text-gray-300 text-sm md:text-base">
              Masuk sebagai: <span className="font-medium text-white">{user?.email}</span>
            </p>
            <div className="bg-black/20 border border-white/10 p-3 rounded-lg inline-block">
              <span className="text-blue-300 font-mono text-sm">User ID:</span>{' '}
              <span className="text-yellow-400 font-mono font-medium text-sm ml-1 select-all">{userId}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp size={120} className="text-blue-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-gray-800 border border-slate-700 p-4 rounded-xl col-span-2 md:col-span-1">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Post</p>
              <p className="text-3xl font-bold text-white mt-1">{loading ? '-' : stats.totalPosts}</p>
            </div>
            <div className="bg-gray-800 border border-slate-700 p-4 rounded-xl">
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Lomba</p>
              <p className="text-3xl font-bold text-white mt-1">{loading ? '-' : stats.lombaCount}</p>
            </div>
            <div className="bg-gray-800 border border-slate-700 p-4 rounded-xl">
              <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Beasiswa</p>
              <p className="text-3xl font-bold text-white mt-1">{loading ? '-' : stats.beasiswaCount}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onNavigate?.('posts')}
              className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 p-5 rounded-xl transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                  <List size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Kelola Postingan</h3>
              </div>
              <p className="text-sm text-gray-400">Buat atau edit info lomba & beasiswa.</p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('notifications')}
              className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 p-5 rounded-xl transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                  <Bell size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Kirim Peringatan</h3>
              </div>
              <p className="text-sm text-gray-400">Notifikasi urgent untuk peserta.</p>
            </button>
          </div>
        </div>

        {/* Right Column: Deadlines */}
        <div className="bg-gray-800 border border-slate-700 rounded-xl p-5 h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-red-400" />
            Deadline Terdekat
          </h3>

          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-500 text-sm italic">Memuat data...</p>
            ) : stats.upcomingDeadlines.length === 0 ? (
              <div className="text-center py-6 bg-gray-900/50 rounded-lg border border-slate-700/50">
                <p className="text-gray-500 text-sm">Tidak ada deadline dekat.</p>
              </div>
            ) : (
              stats.upcomingDeadlines.map((post) => (
                <div key={post.id} className="bg-gray-900/50 hover:bg-gray-900 border border-slate-700/50 p-3 rounded-lg transition-colors group">
                  <h4 className="text-sm font-semibold text-blue-300 line-clamp-1 group-hover:text-blue-200">{post.title}</h4>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded text-white ${post.type === 'lomba' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                      {post.type}
                    </span>
                    <span className="text-red-300 flex items-center gap-1">
                      <AlertCircle size={10} />
                      {new Date(post.closingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {stats.upcomingDeadlines.length > 0 && (
            <button
              onClick={() => onNavigate?.('posts')}
              className="w-full mt-4 py-2 text-xs text-center text-slate-400 hover:text-white border-t border-slate-700/50 hover:bg-slate-700/30 rounded-b-lg transition"
            >
              Lihat Semua
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;