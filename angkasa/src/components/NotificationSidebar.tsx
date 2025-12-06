import { X, TrendingUp, Sparkles, Bell } from "lucide-react";
import { useEffect, useRef } from "react";

interface Notification {
    id: number;
    type: "lomba" | "beasiswa";
    title: string;
    description: string;
    timestamp: string;
    isRead: boolean;
}

const mockNotifications: Notification[] = [
    {
        id: 1,
        type: "lomba",
        title: "Lomba Desain Grafis Nasional 2024",
        description: "Pendaftaran telah dibuka! Deadline: 30 November 2024. Total hadiah 50 juta rupiah.",
        timestamp: "1 jam yang lalu",
        isRead: false,
    },
    {
        id: 2,
        type: "beasiswa",
        title: "Beasiswa S2 Luar Negeri",
        description: "Program beasiswa penuh ke Jepang untuk studi S2. Dibuka hingga 15 Desember 2024.",
        timestamp: "3 jam yang lalu",
        isRead: false,
    },
    {
        id: 3,
        type: "lomba",
        title: "Update: Hackathon Nasional 2024",
        description: "Timeline diperpanjang! Waktu submission diperpanjang hingga 5 Desember 2024.",
        timestamp: "5 jam yang lalu",
        isRead: true,
    },
    {
        id: 4,
        type: "beasiswa",
        title: "Beasiswa Unggulan Kemendikbud",
        description: "Pendaftaran batch 2 telah dibuka. Daftar sekarang untuk kesempatan mendapat beasiswa dalam negeri.",
        timestamp: "1 hari yang lalu",
        isRead: true,
    },
    {
        id: 5,
        type: "lomba",
        title: "Lomba Karya Tulis Ilmiah",
        description: "Kompetisi KTI tingkat universitas. Tema: Inovasi Teknologi untuk Indonesia Maju.",
        timestamp: "2 hari yang lalu",
        isRead: true,
    },
];

interface NotificationSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "lomba":
                return <TrendingUp className="w-5 h-5 text-amber-400" />;
            case "beasiswa":
                return <Sparkles className="w-5 h-5 text-blue-400" />;
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity" />
            )}

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-900/95 border-l border-slate-700/50 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-700/50 rounded-lg">
                                <Bell className="w-5 h-5 text-slate-200" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-100">Notifikasi</h2>
        
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {mockNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group relative p-4 rounded-xl border transition-all duration-200 ${!notification.isRead
                                        ? "bg-slate-800/80 border-slate-600/50 hover:bg-slate-800"
                                        : "bg-slate-800/20 border-transparent hover:bg-slate-800/40"
                                    }`}
                            >
                                {!notification.isRead && (
                                    <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                )}

                                <div className="flex gap-4">
                                    <div className={`mt-1 p-2 rounded-lg h-fit ${notification.type === 'lomba' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                                        }`}>
                                        {getIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${notification.type === 'lomba'
                                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                {notification.type === 'lomba' ? 'Lomba' : 'Beasiswa'}
                                            </span>
                                            <span className="text-xs text-slate-500">{notification.timestamp}</span>
                                        </div>

                                        <h3 className={`text-sm font-semibold leading-snug ${!notification.isRead ? "text-slate-100" : "text-slate-300"
                                            }`}>
                                            {notification.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                            {notification.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
                        <button className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors text-center">
                            Tandai semua sudah dibaca
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
