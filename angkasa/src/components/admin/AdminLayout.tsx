import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    AlertCircle,
    BarChart3,
    FileText
} from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface SidebarItem {
    icon: any;
    label: string;
    path: string;
}

interface AdminLayoutProps {
    children: React.ReactNode;
    role: 'central' | 'provider';
}

export default function AdminLayout({ children, role }: AdminLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const centralItems: SidebarItem[] = [
        { icon: BarChart3, label: 'Performa & Pengaturan', path: '/admin/central' },
        { icon: Users, label: 'Pengguna', path: '/admin/central/users' },
        { icon: FileText, label: 'Manajemen Postingan', path: '/admin/central/posts' },
        { icon: AlertCircle, label: 'Laporan Masalah', path: '/admin/central/reports' },
    ];

    const providerItems: SidebarItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/provider' },
        { icon: Settings, label: 'Pengaturan', path: '/admin/provider/settings' },
    ];

    const items = role === 'central' ? centralItems : providerItems;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/central/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-slate-800 border-r border-slate-700
          transform transition-transform duration-200 ease-in-out
          ${!isSidebarOpen ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700">
                        <span className="text-xl font-bold text-white">
                            {role === 'central' ? 'Admin Pusat' : 'Admin Provider'}
                        </span>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-700">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center px-4 lg:px-8">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-slate-400 hover:text-white lg:hidden"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
