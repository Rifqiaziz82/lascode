// src/components/admin/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import { List, Bell, TrendingUp, Calendar, Award, Clock } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../firebase';
import { GlassCard } from './AdminCommon';

interface AdminPanelProps {
  userId: string;
  user?: {
    displayName?: string | null;
    email?: string | null;
  };
  onNavigate?: (route: 'posts' | 'notifications' | 'certificates') => void;
}

interface DashboardStats {
  totalPosts: number;
  lombaCount: number;
  beasiswaCount: number;
  upcomingDeadlines: any[];
  recentPosts: any[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ userId, user, onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    lombaCount: 0,
    beasiswaCount: 0,
    upcomingDeadlines: [],
    recentPosts: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

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

          const recent = [...posts]
            .sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime())
            .slice(0, 3);

          setStats({
            totalPosts: posts.length,
            lombaCount: posts.filter(p => p.type === 'lomba').length,
            beasiswaCount: posts.filter(p => p.type === 'beasiswa').length,
            upcomingDeadlines: upcoming,
            recentPosts: recent,
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
    <div className="space-y-6 md:space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <GlassCard className="relative overflow-hidden !bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-slate-900/40 !border-white/10">
        <div className="relative z-10 grid md:grid-cols-2 gap-4 items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-300 mb-2 font-medium bg-blue-500/10 w-fit px-3 py-1 rounded-full text-xs md:text-sm">
              <Clock size={14} />
              <span>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-2 leading-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{displayName}</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Anda masuk sebagai admin provider.
            </p>
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
          <TrendingUp size={240} className="text-white" />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <GlassCard className="col-span-2 md:col-span-1 group hover:border-blue-500/30 transition-colors cursor-default">
              <div className="flex justify-between items-start mb-3">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Post</p>
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-blue-500/0 group-hover:shadow-blue-500/20">
                  <List size={18} />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">{loading ? '-' : stats.totalPosts}</p>
              <p className="text-xs text-slate-500 font-medium">Konten aktif</p>
            </GlassCard>

            <GlassCard className="group hover:border-purple-500/30 transition-colors cursor-default">
              <div className="flex justify-between items-start mb-3">
                <p className="text-purple-400 text-xs font-bold uppercase tracking-wider">Lomba</p>
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-purple-500/0 group-hover:shadow-purple-500/20">
                  <Award size={18} />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">{loading ? '-' : stats.lombaCount}</p>
            </GlassCard>

            <GlassCard className="group hover:border-emerald-500/30 transition-colors cursor-default">
              <div className="flex justify-between items-start mb-3">
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Beasiswa</p>
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-emerald-500/0 group-hover:shadow-emerald-500/20">
                  <TrendingUp size={18} />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">{loading ? '-' : stats.beasiswaCount}</p>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              Menu Cepat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => onNavigate?.('posts')}
                className="bg-slate-800/40 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 p-4 md:p-5 rounded-2xl transition-all duration-200 text-left group hover:-translate-y-1 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                    <List size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white leading-tight">Kelola<br />Postingan</h3>
                </div>
                <p className="text-xs text-slate-400 group-hover:text-blue-200 transition-colors">Buat atau edit info.</p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.('certificates')}
                className="bg-slate-800/40 hover:bg-emerald-600/10 border border-white/5 hover:border-emerald-500/30 p-4 md:p-5 rounded-2xl transition-all duration-200 text-left group hover:-translate-y-1 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                    <Award size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white leading-tight">Kirim<br />Sertifikat</h3>
                </div>
                <p className="text-xs text-slate-400 group-hover:text-emerald-200 transition-colors">Kirim e-Sertifikat.</p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.('notifications')}
                className="bg-slate-800/40 hover:bg-purple-600/10 border border-white/5 hover:border-purple-500/30 p-4 md:p-5 rounded-2xl transition-all duration-200 text-left group hover:-translate-y-1 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-600 rounded-lg text-white shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                    <Bell size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white leading-tight">Kirim<br />Notifikasi</h3>
                </div>
                <p className="text-xs text-slate-400 group-hover:text-purple-200 transition-colors">Info urgent user.</p>
              </button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <GlassCard>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-slate-500 rounded-full"></span>
                Baru Ditambahkan
              </h3>
              <button
                onClick={() => onNavigate?.('posts')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 bg-blue-500/10 rounded-lg hover:bg-blue-500/20"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : stats.recentPosts.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4 bg-white/5 rounded-xl border border-white/5 border-dashed">Belum ada postingan.</p>
              ) : (
                stats.recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-200 group">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden relative border border-white/10">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <List size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${post.type === 'lomba' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                          {post.type}
                        </span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(post.timestamp || post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">{post.title}</h4>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Deadlines */}
        <div className="h-fit lg:sticky lg:top-8">
          <GlassCard className="!bg-gradient-to-b from-slate-900/60 to-slate-900/40">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Calendar size={18} className="text-red-400" />
              Deadline Terdekat
            </h3>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : stats.upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5 border-dashed">
                  <p className="text-slate-500 text-sm">Tidak ada deadline dekat.</p>
                </div>
              ) : (
                stats.upcomingDeadlines.map((post) => (
                  <div key={post.id} className="relative bg-slate-950/50 hover:bg-slate-900 border border-white/5 p-4 rounded-xl transition-all duration-200 group overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${post.type === 'lomba' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                    <div className="pl-2 relative z-10">
                      <h4 className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-blue-300 transition-colors mb-2">{post.title}</h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-red-300 flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-md font-medium border border-red-500/10">
                          <Clock size={12} />
                          {new Date(post.closingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;