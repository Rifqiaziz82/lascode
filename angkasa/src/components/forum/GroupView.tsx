import { useState } from 'react';
import { Search, MoreVertical, Send, Paperclip, Smile } from 'lucide-react';

interface Group {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    image?: string;
}

const mockGroups: Group[] = [
    { id: '1', name: 'Diskusi Lomba UI/UX', lastMessage: 'Budi: Deadline pendaftaran kapan ya?', time: '10:30', unread: 2 },
    { id: '2', name: 'Belajar Python Bareng', lastMessage: 'Siti: Ada yang bisa bantu error ini?', time: 'Kemarin', unread: 0 },
    { id: '3', name: 'Info Beasiswa 2025', lastMessage: 'Admin: Link pendaftaran sudah dibuka!', time: '2 hari lalu', unread: 5 },
];

export default function GroupView() {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [message, setMessage] = useState('');

    return (
        <div className="flex h-[calc(100vh-140px)] bg-slate-800/30 border border-slate-600/30 rounded-xl overflow-hidden">
            {/* Sidebar List */}
            <div className={`${selectedGroup ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-slate-600/30`}>
                <div className="p-4 border-b border-slate-600/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Cari grup..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {mockGroups.map((group) => (
                        <div
                            key={group.id}
                            onClick={() => setSelectedGroup(group)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 transition-colors ${selectedGroup?.id === group.id ? 'bg-slate-700/40' : ''
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-slate-300">{group.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-medium text-slate-200 truncate">{group.name}</h3>
                                    <span className="text-xs text-slate-500">{group.time}</span>
                                </div>
                                <p className="text-sm text-slate-400 truncate">{group.lastMessage}</p>
                            </div>
                            {group.unread > 0 && (
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">{group.unread}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            {selectedGroup ? (
                <div className="flex-1 flex flex-col bg-slate-900/20">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-600/30 flex items-center justify-between bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedGroup(null)}
                                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
                            >
                                ←
                            </button>
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                                <span className="font-bold text-slate-300">{selectedGroup.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-200">{selectedGroup.name}</h3>
                                <p className="text-xs text-slate-400">32 Anggota</p>
                            </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="flex justify-center">
                            <span className="px-3 py-1 bg-slate-800/50 rounded-full text-xs text-slate-500">Hari ini</span>
                        </div>
                        {/* Mock Chat Bubbles */}
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0"></div>
                            <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                                <p className="text-slate-300 text-sm">Halo semua, ada yang punya info lomba UI/UX terbaru?</p>
                                <span className="text-xs text-slate-500 mt-1 block">10:15</span>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-row-reverse">
                            <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none max-w-[80%]">
                                <p className="text-white text-sm">Coba cek di website Puspresnas, kemarin baru buka pendaftaran.</p>
                                <span className="text-xs text-blue-200 mt-1 block">10:18</span>
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-600/30 bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ketik pesan..."
                                className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-full text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                                <Smile className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center flex-col text-slate-500">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 opacity-50" />
                    </div>
                    <p>Pilih grup untuk mulai chatting</p>
                </div>
            )}
        </div>
    );
}
