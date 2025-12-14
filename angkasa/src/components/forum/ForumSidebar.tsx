import { Users, MessageSquare, Calendar, Compass, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForumSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

export default function ForumSidebar({ activeView, setActiveView }: ForumSidebarProps) {
    const menuItems = [
        { id: 'feed', label: 'Jelajah', icon: Compass },
        { id: 'community', label: 'Komunitas', icon: Users },
        { id: 'group', label: 'Diskusi Grup', icon: MessageSquare },
        { id: 'event', label: 'Kalender Event', icon: Calendar },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-1/7 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                    {/* Main Navigation */}
                    <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-3 shadow-xl overflow-hidden">
                        <div className="px-4 py-3 mb-2 flex items-center gap-2">
                            
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu Utama</h2>
                        </div>
                        <nav className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeView === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveView(item.id)}
                                        className="relative w-full group"
                                    >
                                        <div className={`relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                            isActive 
                                              ? 'text-white' 
                                              : 'text-slate-400 hover:text-slate-200'
                                        }`}>
                                            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-400' : ''}`} />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </div>
                                        
                                        {/* Active Background */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute inset-0 bg-slate-700/50 rounded-xl border border-slate-600/50"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        {/* Hover Background */}
                                        {!isActive && (
                                            <div className="absolute inset-0 bg-slate-800/0 group-hover:bg-slate-700/30 rounded-xl transition-colors" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 pb-safe safe-area-padding-bottom">
                <nav className="flex justify-around items-center px-2 py-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                                    isActive ? 'text-blue-400' : 'text-slate-500'
                                }`}
                            >
                                <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-blue-500/20' : ''}`}>
                                  <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                                </div>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
