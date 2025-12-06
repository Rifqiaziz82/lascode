import { Users, MessageSquare, Calendar, MessageCircle, Home } from 'lucide-react';

interface ForumSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

export default function ForumSidebar({ activeView, setActiveView }: ForumSidebarProps) {
    const menuItems = [
        { id: 'feed', label: 'Beranda', icon: Home },
        { id: 'community', label: 'Komunitas', icon: Users },
        { id: 'group', label: 'Grup', icon: MessageSquare },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'event', label: 'Acara', icon: Calendar },
    ];

    return (
        <>
            {/* Desktop Sidebar - Left side, vertical */}
            <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
                <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 p-4 sticky top-24">
                    <h2 className="text-slate-200 font-semibold mb-4 px-2">Navigasi Menu</h2>
                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeView === item.id
                                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                        : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Mobile Bottom Navigation - Sticky at bottom, icon only */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-600/30 px-4 py-3 safe-area-padding-bottom">
                <nav className="flex justify-around items-center max-w-screen-sm mx-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${activeView === item.id
                                    ? 'text-blue-400'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
