import React, { useState } from 'react';
import { List, Bell, Menu, X } from 'lucide-react';
import AdminPanel from './AdminPanel.tsx';
import AdminPost from './AdminPost.tsx';
import AdminNotif from './AdminNotif.tsx';
import { generateId } from './AdminCommon.tsx';

type AppRoute = 'dashboard' | 'posts' | 'notifications';

export const AdminDash: React.FC = () => {
  const [userId] = useState(() => generateId());
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (currentRoute) {
      case 'posts':
        return <AdminPost />;
      case 'notifications':
        return <AdminNotif />;
      default:
        return <AdminPanel userId={userId} />;
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

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex">
        <aside className="w-64 bg-slate-800 border border-slate-700 shadow-2xl fixed h-full p-4">
          <div className="text-2xl font-black text-white mb-8 border-b border-slate-700 pb-4">
            ADMIN
          </div>
          <nav className="space-y-2 flex-grow">
            <NavItem route="dashboard" Icon={List} label="Beranda" />
            <NavItem route="posts" Icon={List} label="Postingan" />
            <NavItem route="notifications" Icon={Bell} label="Notifikasi" />
          </nav>
        </aside>
      </div>

      {/*  MOBILE NAVBAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-slate-700 z-50 px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-white">ADMIN</div>
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
        className={`fixed top-0 right-0 w-64 h-full bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } md:hidden`}
        style={{ top: '56px' }}
      >
        <div className="p-4 pt-4">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
            <div className="text-xl font-bold text-white">MENU</div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white"
              aria-label="Tutup menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="space-y-2">
            <NavItem route="dashboard" Icon={List} label="Dashboard" isMobile={true} />
            <NavItem route="posts" Icon={List} label="Postingan" isMobile={true} />
            <NavItem route="notifications" Icon={Bell} label="Notifikasi" isMobile={true} />
          </nav>
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