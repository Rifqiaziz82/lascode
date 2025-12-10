// src/components/admin/AdminDash.tsx
import React, { useState, useEffect } from 'react';
import { List, Bell, Menu, X, LogOut } from 'lucide-react';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, rtdb } from '../../firebase';
import AdminPanel from './AdminPanel.tsx';
import AdminPost from './AdminPost.tsx';
import AdminNotif from './AdminNotif.tsx';
import AdminLogin from './AdminLogin.tsx';

type AppRoute = 'dashboard' | 'posts' | 'notifications';

const getColorFromUid = (uid: string) => {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 35%)`;
};

const getInitials = (name: string | null | undefined, email?: string | null) => {
  const source = name || email?.split('@')[0] || 'Admin';
  return source
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const AdminDash: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<{ uid: string; displayName: string | null; email: string | null } | null>(null);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

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

            setFirebaseUser({
              uid: user.uid,
              displayName: displayNameToUse,
              email: user.email,
            });
          } else {
            setIsAdminAuthenticated(false);
            setFirebaseUser(null);
          }
        } catch (error) {
          console.error('Error checking admin status or updating profile:', error);
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

  const handleLoginSuccess = () => {};

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderContent = () => {
    switch (currentRoute) {
      case 'posts':
        return <AdminPost />;
      case 'notifications':
        return <AdminNotif />;
      default:
        return (
          <AdminPanel
            userId={firebaseUser?.uid || ''}
            user={{
              displayName: firebaseUser?.displayName,
              email: firebaseUser?.email,
            }}
            onNavigate={(r) => setCurrentRoute(r)}
          />
        );
    }
  };

  const NavItem: React.FC<{ route: AppRoute; Icon: React.ElementType; label: string; isMobile?: boolean }> = ({
    route,
    Icon,
    label,
    isMobile = false,
  }) => {
    const isActive = currentRoute === route;
    return (
      <button
        onClick={() => {
          setCurrentRoute(route);
          if (isMobile) {
            setMobileMenuOpen(false);
          }
        }}
        className={`flex items-center space-x-3 p-3 rounded-xl transition duration-200 w-full text-left ${
          isActive
            ? 'bg-blue-700 text-white shadow-lg shadow-blue-900/50'
            : 'text-gray-400 hover:bg-gray-800 hover:text-blue-300'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-blue-300' : 'text-blue-400'} />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  const LogoutButton: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => (
    <button
      onClick={() => {
        handleLogout();
        if (isMobile) setMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 p-3 rounded-xl transition duration-200 w-full text-left text-gray-400 hover:bg-red-900/30 hover:text-red-300 ${
        isMobile ? '' : 'mt-auto'
      }`}
      aria-label="Logout"
    >
      <LogOut size={20} className="text-red-400" />
      <span className="font-medium">Logout</span>
    </button>
  );

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Memeriksa autentikasi...</div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const displayName = firebaseUser?.displayName;
  const email = firebaseUser?.email;
  const uid = firebaseUser?.uid;
  const initials = getInitials(displayName, email);
  const displayText = displayName || email?.split('@')[0] || 'Admin';
  const profileColor = uid ? getColorFromUid(uid) : 'hsl(210, 70%, 35%)'; // fallback

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex">
        <aside className="w-64 bg-slate-800 border border-slate-700 shadow-2xl fixed h-full p-4 flex flex-col">
          <div className="flex items-center mb-6 gap-2">
            <div
              className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center"
              style={{ backgroundColor: profileColor }}
            >
              {initials}
            </div>
            <div>
              <div className="text-lg font-bold text-white truncate max-w-[140px]">{displayText}</div>
              {uid && (
                <div className="text-xs text-gray-400 font-mono truncate max-w-[140px]">
                  {uid.substring(0, 8)}...
                </div>
              )}
            </div>
          </div>
          <nav className="space-y-2 flex-grow">
            <NavItem route="dashboard" Icon={List} label="Beranda" />
            <NavItem route="posts" Icon={List} label="Postingan" />
            <NavItem route="notifications" Icon={Bell} label="Notifikasi" />
          </nav>
          <LogoutButton />
        </aside>
      </div>

      {/* MOBILE NAVBAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-slate-700 z-50 px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-white truncate max-w-[150px]">{displayText}</div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
          aria-label="Buka menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 w-64 bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } md:hidden flex flex-col`}
        style={{ top: '56px', height: 'calc(100vh - 56px)' }}
      >
        <div className="p-4 pb-2 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center mr-3"
              style={{ backgroundColor: profileColor }}
            >
              {initials}
            </div>
            <div>
              <div className="text-lg font-bold text-white">{displayText}</div>
              {uid && (
                <div className="text-xs text-gray-400 font-mono">
                  {uid.substring(0, 12)}...
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-300 hover:text-white"
            aria-label="Tutup menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 pt-4 flex-1 overflow-y-auto">
          <nav className="space-y-2">
            <NavItem route="dashboard" Icon={List} label="Beranda" isMobile={true} />
            <NavItem route="posts" Icon={List} label="Postingan" isMobile={true} />
            <NavItem route="notifications" Icon={Bell} label="Notifikasi" isMobile={true} />
          </nav>
        </div>

        <div className="px-4 pb-4">
          <LogoutButton isMobile={true} />
        </div>
      </div>

      {/* OVERLAY BLUR */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="p-4 md:p-8 md:ml-64 pt-20 md:pt-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDash;