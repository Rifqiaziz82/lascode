import { Search, UserPlus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ForumRightSidebarProps {
    onSearch: (query: string) => void;
    onSearchClick?: () => void;
}

const popularSearches = [
    "Lomba Desain 2024",
    "Beasiswa S2 Full",
    "Magang BUMN",
    "Webinar Gratis",
    "Lomba Coding",
    "Beasiswa KIP Kuliah"
];

const suggestedUsers = [
    { id: 1, name: "Sarah Amalia", role: "Mahasiswa UI", avatar: "S" },
    { id: 2, name: "Rizky Ramadhan", role: "Frontend Dev", avatar: "R" },
    { id: 3, name: "Dina Kusuma", role: "Awardee LPDP", avatar: "D" },
];

export default function ForumRightSidebar({ onSearch, onSearchClick }: ForumRightSidebarProps) {
    const navigate = useNavigate();

    const handleSearchClick = (term: string) => {
        onSearch(term);
        if (onSearchClick) {
            onSearchClick();
        }
    };

    return (
        <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            {/* Popular Searches */}
            <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 p-5 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <h2 className="text-slate-200 font-semibold">Pencarian Populer</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term, index) => (
                        <button
                            key={index}
                            onClick={() => handleSearchClick(term)}
                            className="px-3 py-1.5 bg-slate-700/40 hover:bg-slate-700/60 border border-slate-600/30 rounded-lg text-sm text-slate-300 transition-colors text-left"
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </div>

            {/* People You May Know */}
            <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 p-5 lg:sticky lg:top-[280px]">
                <div className="flex items-center gap-2 mb-4">
                    <UserPlus className="w-5 h-5 text-green-400" />
                    <h2 className="text-slate-200 font-semibold">Orang Mungkin Anda Kenal</h2>
                </div>
                <div className="space-y-4">
                    {suggestedUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between group">
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => navigate(`/user/${user.id}`)}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/30">
                                    <span className="font-medium text-slate-300">{user.avatar}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-200 text-sm group-hover:text-blue-400 transition-colors">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.role}</p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors" title="Ikuti">
                                <UserPlus className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Lihat Lainnya
                </button>
            </div>
        </div>
    );
}
