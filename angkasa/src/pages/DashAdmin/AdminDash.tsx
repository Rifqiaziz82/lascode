import React, { useState, useEffect } from 'react';
import { List, Menu, X, LogOut, Award, LayoutDashboard, Calendar } from 'lucide-react';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { ref, get } from 'firebase/database';

import { auth, rtdb } from '../../firebase';
import AdminPanel from './AdminPanel';
import AdminPost from './AdminPost';
import AdminEvent from './AdminEvent';
import AdminLogin from './AdminLogin';
import AdminCertificate from './AdminCertificate';

type AppRoute = 'dashboard' | 'posts' | 'events' | 'certificates';

const getColorFromUid = (uid: string) => {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`; // Brighter for dark mode
};

const getInitials = (name: string | null | undefined, email?: string | null) => {
  const source = name || email?.split('@')[0] || 'Admin';
  return source.split(/\s+/).map(part => part[0]).join('').substring(0, 2).toUpperCase();
};

const ProfileDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: { displayName?: string | null; email?: string | null; uid: string };
  initials: string;
  profileColor: string;
}> = ({ isOpen, onClose, user, initials, profileColor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 transition-opacity duration-200"
        onClick={onClose}
      />
      {/* Modal Content */}
      <div
        className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all duration-200 scale-100 opacity-100 animate-in fade-in zoom-in-95"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className="w-24 h-24 rounded-full text-white text-3xl font-bold flex items-center justify-center mb-4 shadow-xl ring-4 ring-slate-800"
            style={{ backgroundColor: profileColor, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
          >
            {initials}
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{user.displayName || 'Admin'}</h2>
          <p className="text-slate-400 text-sm mb-6">{user.email}</p>

          <div className="w-full bg-black/20 rounded-xl p-4 border border-white/5 mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">User ID</p>
            <div className="flex items-center justify-between bg-black/40 rounded-lg p-2.5 border border-white/5 font-mono text-xs text-blue-300">
              <span className="truncate">{user.uid}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/20"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminDash: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<{ uid: string; displayName: string | null; email: string | null } | null>(null);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminRef = ref(rtdb, `admins/${user.uid}`);
          const snapshot = await get(adminRef);

          if (snapshot.exists()) {
            setIsAdminAuthenticated(true);
            let displayNameToUse = user.displayName;
            if (!displayNameToUse && user.email) {
              displayNameToUse = user.email.split('@')[0];
              await updateProfile(user, { displayName: displayNameToUse });
            }
            setFirebaseUser({ uid: user.uid, displayName: displayNameToUse, email: user.email });
          } else {
            setIsAdminAuthenticated(false);
            setFirebaseUser(null);
          }
        } catch (error) {
          console.error('Error checking admin:', error);
          setIsAdminAuthenticated(false);
          setFirebaseUser(null);
        }
      } else {
        setIsAdminAuthenticated(false);
        setFirebaseUser(null);
      }
      setAdminLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (error) { console.error('Logout error:', error); }
  };

  const renderContent = () => {
    // Simple conditional rendering without animation wrapper
    switch (currentRoute) {
      case 'posts': return <AdminPost />;
      case 'events': return <AdminEvent />;
      case 'certificates': return <AdminCertificate />;
      default: return (
        <AdminPanel
          userId={firebaseUser?.uid || ''}
          user={{ displayName: firebaseUser?.displayName, email: firebaseUser?.email }}
          onNavigate={(r: any) => setCurrentRoute(r)}
        />
      );
    }
  };

  const NavItem: React.FC<{ route: AppRoute; Icon: React.ElementType; label: string }> = ({ route, Icon, label }) => {
    const isActive = currentRoute === route;
    return (
      <button
        onClick={() => { setCurrentRoute(route); setMobileMenuOpen(false); }}
        className={`relative flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-200 w-full text-left group overflow-hidden ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
      >
        {isActive && (
          <div className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)]" />
        )}
        <Icon size={20} className={`relative z-10 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-300'}`} />
        <span className="relative z-10 font-medium">{label}</span>
      </button>
    );
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          <div className="text-slate-400 text-sm font-medium">Memuat Dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) return <AdminLogin onLoginSuccess={() => { }} />;

  const displayName = firebaseUser?.displayName;
  const initials = getInitials(displayName, firebaseUser?.email);
  const profileColor = firebaseUser?.uid ? getColorFromUid(firebaseUser.uid) : 'hsl(210, 70%, 50%)';

  return (
    // Fixed background setup to ensure it never cuts off on scroll
    <div className="relative min-h-screen text-slate-100 font-sans selection:bg-blue-500/30">

      {/* Background Layer - Fixed to viewport */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-slate-950 bg-slate-950"></div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 md:bg-slate-900/80 backdrop-blur-none md:backdrop-blur-xl border-r border-white/5 fixed inset-y-0 z-50">
        <div className="p-6">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
          >
            <div
              className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ backgroundColor: profileColor }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-200 truncate">{displayName}</div>
              <div className="text-xs text-slate-500 font-mono truncate">ID: {firebaseUser?.uid.slice(0, 8)}</div>
            </div>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu Utama</div>
          <NavItem route="dashboard" Icon={LayoutDashboard} label="Beranda" />
          <NavItem route="posts" Icon={List} label="Postingan & Lomba" />
          <NavItem route="events" Icon={Calendar} label="Event & Seminar" />
          <NavItem route="certificates" Icon={Award} label="Kirim Sertifikat" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-xl transition duration-200 w-full text-left text-slate-400 hover:bg-red-500/10 hover:text-red-400 group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE NAVBAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 shadow-xl border-b border-white/5 z-50 px-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white truncate max-w-[250px]">{displayName || 'Admin'}</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* MOBILE MENU - Optimized with CSS Transitions */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${mobileMenuOpen ? 'visible' : 'invisible delay-300'
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/80 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 right-0 w-72 h-full bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
            <span className="text-sm font-semibold text-slate-400">Navigasi</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 border-b border-white/5">
            <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 w-full p-2 rounded-lg bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg" style={{ backgroundColor: profileColor }}>{initials}</div>
              <div className="text-left overflow-hidden">
                <div className="font-bold text-white truncate">{displayName}</div>
                <div className="text-xs text-slate-400 truncate">{firebaseUser?.email}</div>
              </div>
            </button>
          </div>

          <div className="p-4 space-y-2 flex-1 overflow-y-auto">
            <NavItem route="dashboard" Icon={LayoutDashboard} label="Beranda" />
            <NavItem route="posts" Icon={List} label="Postingan" />
            <NavItem route="events" Icon={Calendar} label="Event & Seminar" />
            <NavItem route="certificates" Icon={Award} label="Kirim Sertifikat" />
          </div>

          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="flex items-center space-x-3 p-3 rounded-xl w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="md:pl-72 pt-16 md:pt-0 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>

      <ProfileDetailModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={{ displayName, email: firebaseUser?.email, uid: firebaseUser?.uid || '' }}
        initials={initials}
        profileColor={profileColor}
      />
    </div>
  );
};

export default AdminDash;