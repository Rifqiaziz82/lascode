import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../AuthProvider';
import {
    Heart,
    MessageCircle,
    Share2,
    Send,
    Search,
    Trophy,
    GraduationCap,
    Copy,
    MessageSquareIcon,
    LinkIcon,
    ChevronDown,
    Filter,
} from 'lucide-react';

interface Comment {
    id: number;
    author: string;
    avatar?: string;
    text: string;
    timestamp: string;
}

interface Post {
    id: number;
    author: string;
    avatar: string;
    content: string;
    image?: string;
    likes: number;
    comments: Comment[];
    timestamp: string;
    category: 'lomba' | 'beasiswa';
    title?: string;
    type: 'lomba' | 'beasiswa';
    tags: string[];
}

const mockPosts: Post[] = [
    {
        id: 1,
        author: 'Ahmad Syahputra',
        avatar: '',
        content: 'Senang sekali bisa bergabung dengan komunitas Angkasa! Ada info lomba desain grafis terbaru?',
        image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=400&fit=crop',
        likes: 24,
        comments: [{ id: 101, author: 'Siti', text: 'Ada, cek di web Kemenparekraf!', timestamp: '1 jam lalu' }],
        timestamp: '2 jam yang lalu',
        category: 'lomba',
        title: 'Lomba Desain Grafis Nasional 2025',
        type: 'lomba',
        tags: ['desain', 'nasional', 'mahasiswa'],
    },
    {
        id: 2,
        author: 'Siti Nurhaliza',
        avatar: '',
        content: 'Baru saja mendapat beasiswa dari program Angkasa! Terima kasih banyak untuk platformnya yang sangat membantu 🚀',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop',
        likes: 156,
        comments: [],
        timestamp: '5 jam yang lalu',
        category: 'beasiswa',
        title: 'Beasiswa LPDP S2 Luar Negeri',
        type: 'beasiswa',
        tags: ['LPDP', 'luar negeri', 'S2', 'pemerintah'],
    },
    {
        id: 3,
        author: 'Budi Santoso',
        avatar: '',
        content: 'Ada yang mau ikut lomba programming minggu depan? Yuk diskusi di sini!',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
        likes: 42,
        comments: [
            { id: 102, author: 'Dewi', text: 'Saya ikut! Tim kita bisa kolab?', timestamp: '3 jam lalu' },
            { id: 103, author: 'Ahmad', text: 'Boleh, cek Discord grup kita', timestamp: '2 jam lalu' },
        ],
        timestamp: '1 hari yang lalu',
        category: 'lomba',
        title: 'Hackathon Nasional 2025',
        type: 'lomba',
        tags: ['IT', 'programming', 'nasional', 'mahasiswa'],
    },
    {
        id: 4,
        author: 'Dewi Lestari',
        avatar: '',
        content: 'Info beasiswa S2 ke Jepang! Deadline bulan depan, yuk siapkan dokumen dari sekarang!',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
        likes: 89,
        comments: [],
        timestamp: '1 hari yang lalu',
        category: 'beasiswa',
        title: 'MEXT Scholarship Jepang',
        type: 'beasiswa',
        tags: ['MEXT', 'Jepang', 'luar negeri', 'S2', 'pemerintah'],
    },
    {
        id: 5,
        author: 'Rina Wijaya',
        avatar: '',
        content: 'Butuh teman untuk ikut lomba debat bahasa Inggris. Yang berminat DM ya!',
        likes: 18,
        comments: [],
        timestamp: '2 hari yang lalu',
        category: 'lomba',
        title: 'Lomba Debat Nasional 2025',
        type: 'lomba',
        tags: ['debat', 'bahasa Inggris', 'nasional'],
    },
    {
        id: 6,
        author: 'Fajar Ramadhan',
        avatar: '',
        content: 'Baru lolos seleksi beasiswa Turkiye Burslari! Senang banget 🎉',
        image: 'https://images.unsplash.com/photo-1464927495403-1c0e3a9e8e9a?w=800&h=400&fit=crop',
        likes: 210,
        comments: [{ id: 104, author: 'Siti', text: 'Selamat! Boleh minta tipsnya?', timestamp: '12 jam lalu' }],
        timestamp: '2 hari yang lalu',
        category: 'beasiswa',
        title: 'Beasiswa Turkiye Burslari',
        type: 'beasiswa',
        tags: ['Turki', 'luar negeri', 'S1', 'pemerintah'],
    },
    {
        id: 7,
        author: 'Maya Putri',
        avatar: '',
        content: 'Ada rekomendasi lomba menulis esai tingkat SMA?',
        likes: 7,
        comments: [{ id: 105, author: 'Budi', text: 'Coba cek lomba dari Kemdikbud, banyak kok', timestamp: '1 hari lalu' }],
        timestamp: '3 hari yang lalu',
        category: 'lomba',
        title: 'Lomba Menulis Esai 2025',
        type: 'lomba',
        tags: ['menulis', 'esai', 'SMA'],
    },
    {
        id: 8,
        author: 'Andi Pratama',
        avatar: '',
        content: 'Beasiswa Full Ride ke Singapore Management University (SMU) dibuka! Siapa mau apply bareng?',
        likes: 64,
        comments: [],
        timestamp: '4 hari yang lalu',
        category: 'beasiswa',
        title: 'Beasiswa SMU Singapura',
        type: 'beasiswa',
        tags: ['Singapura', 'luar negeri', 'S1', 'swasta'],
    },
    {
        id: 9,
        author: 'Lina Sari',
        avatar: '',
        content: 'Lomba robotik ITB 2025 segera dibuka! Tim kami butuh 1 orang lagi untuk divisi mechanical.',
        image: 'https://images.unsplash.com/photo-1581273558035-9f5fc9d9e8e8?w=800&h=400&fit=crop',
        likes: 31,
        comments: [],
        timestamp: '5 hari yang lalu',
        category: 'lomba',
        title: 'Lomba Robotik ITB 2025',
        type: 'lomba',
        tags: ['robotik', 'ITB', 'nasional', 'mahasiswa'],
    },
    {
        id: 10,
        author: 'Kevin Halim',
        avatar: '',
        content: 'Beasiswa AAS Australia (S1/S2) mulai dibuka! Deadline 30 November.',
        likes: 95,
        comments: [{ id: 106, author: 'Dewi', text: 'Ada yang sudah apply? Bagaimana prosesnya?', timestamp: '2 hari lalu' }],
        timestamp: '6 hari yang lalu',
        category: 'beasiswa',
        title: 'Beasiswa AAS Australia',
        type: 'beasiswa',
        tags: ['Australia', 'luar negeri', 'S1', 'S2', 'pemerintah'],
    },
];

const availableTypes = ['lomba', 'beasiswa'] as const;
const availableCategories = [
    'IT', 'luar negeri', 'S2', 'nasional', 'mahasiswa', 'pemerintah',
    'desain', 'programming', 'Jepang', 'LPDP', 'MEXT', 'debat',
    'bahasa Inggris', 'menulis', 'esai', 'SMA', 'Singapura', 'robotik', 'Australia'
];

export default function ForumFeed({
    searchQuery,
    setSearchQuery,
    openSearchDropdown
}: {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    openSearchDropdown?: boolean;
}) {
    const { user } = useAuth();
    const [posts] = useState<Post[]>(mockPosts);
    // searchQuery state removed, using prop
    const [selectedType, setSelectedType] = useState<(typeof availableTypes)[number] | ''>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'rekomendasi' | 'following'>('rekomendasi');
    const [openComments, setOpenComments] = useState<Set<number>>(new Set());
    const [openShares, setOpenShares] = useState<Set<number>>(new Set());
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);

    // Open search dropdown when triggered externally
    useEffect(() => {
        if (openSearchDropdown) {
            setIsSearchOpen(true);
        }
    }, [openSearchDropdown]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLike = (postId: number) => {
        const heartEl = document.getElementById(`heart-${postId}`);
        if (heartEl) {
            heartEl.classList.remove('animate-ping');
            void heartEl.offsetWidth;
            heartEl.classList.add('animate-ping');
            setTimeout(() => heartEl.classList.remove('animate-ping'), 1000);
        }
    };

    const toggleComments = (postId: number) => {
        setOpenComments(prev => {
            const newSet = new Set(prev);
            newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
            return newSet;
        });
    };

    const toggleShare = (postId: number) => {
        setOpenShares(prev => {
            const newSet = new Set(prev);
            newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
            return newSet;
        });
    };

    const handleCommentSubmit = (postId: number, commentText: string) => {
        if (!commentText.trim() || !user) return;
        const input = document.getElementById(`comment-input-${postId}`) as HTMLInputElement | null;
        if (input) input.value = '';
    };

    const shareToWhatsApp = (postId: number) => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        const url = `${window.location.origin}/forum#${postId}`;
        const text = `Lihat di Angkasa: ${post.title || 'Postingan menarik'}\n"${post.content.substring(0, 80)}..."`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
    };

    const copyLink = (postId: number) => {
        const url = `${window.location.origin}/forum#${postId}`;
        navigator.clipboard.writeText(url).catch(console.error);
    };

    const filteredPosts = useMemo(() => {
        let result = [...posts];

        if (activeTab === 'following') {
            result = posts.filter((_, i) => i % 2 === 0);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(post =>
                post.title?.toLowerCase().includes(q) ||
                post.content.toLowerCase().includes(q) ||
                post.author.toLowerCase().includes(q) ||
                post.tags.some(tag => tag.toLowerCase().includes(q))
            );
        }

        if (selectedType) {
            result = result.filter(post => post.type === selectedType);
        }

        if (selectedCategory) {
            result = result.filter(post =>
                post.tags.map(t => t.toLowerCase()).includes(selectedCategory.toLowerCase())
            );
        }

        return result;
    }, [posts, searchQuery, selectedType, selectedCategory, activeTab]);

    if (!user) return null;

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* 🔍 Search Toggle */}
            <section className="mb-6" ref={searchRef}>
                <div className="relative">
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-600/40 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500/30 backdrop-blur-sm transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Search className="w-5 h-5 text-slate-400" />
                            <span>{isSearchOpen ? 'Cari lomba, beasiswa...' : '🔍 Cari di Forum'}</span>
                        </div>
                        <Filter className="w-4 h-4 text-slate-500" />
                    </button>

                    {/* Dropdown Filter */}
                    {isSearchOpen && (
                        <div className="absolute z-10 mt-2 w-full bg-slate-800/70 backdrop-blur-md border border-slate-600/40 rounded-xl shadow-xl overflow-hidden">
                            <div className="p-4 space-y-4">
                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Kata kunci..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                                    />
                                </div>

                                {/* Tipe */}
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5">Tipe</label>
                                    <div className="relative">
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value as any)}
                                            className="w-full py-2.5 pl-3 pr-8 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 appearance-none focus:outline-none focus:ring-1 focus:ring-slate-500"
                                        >
                                            <option value="" className="bg-slate-800 text-slate-400">Semua</option>
                                            <option value="lomba" className="bg-slate-800 text-slate-200">🏆 Lomba</option>
                                            <option value="beasiswa" className="bg-slate-800 text-slate-200">🎓 Beasiswa</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Jenis */}
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5">Jenis</label>
                                    <div className="relative">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full py-2.5 pl-3 pr-8 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 appearance-none focus:outline-none focus:ring-1 focus:ring-slate-500"
                                        >
                                            <option value="" className="bg-slate-800 text-slate-400">Semua Jenis</option>
                                            {availableCategories.map(cat => (
                                                <option key={cat} value={cat} className="bg-slate-800 text-slate-200">{cat}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedType('');
                                            setSelectedCategory('');
                                        }}
                                        className="flex-1 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => setIsSearchOpen(false)}
                                        className="flex-1 px-3 py-2 text-sm bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                                    >
                                        Terapkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ✅ Pembatas Cantik */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600/30"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-4 py-1 bg-slate-900/50 backdrop-blur-sm rounded-full border border-slate-600/30 text-slate-400 text-xs">
                        🔮 Temukan Peluangmu
                    </span>
                </div>
            </div>

            {/* ✅ Tab Container */}
            <section className="mb-8">
                <div className="flex flex-wrap gap-3 justify-center">
                    {[
                        { key: 'rekomendasi', label: 'Rekomendasi', icon: '' },
                        { key: 'following', label: 'Diikuti', icon: '' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${activeTab === tab.key
                                ? 'bg-slate-600 text-white shadow-md'
                                : 'bg-slate-800/40 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* 📝 Posts */}
            <section>
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-600/30">
                        <p className="text-slate-400">Tidak ada postingan yang sesuai.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {filteredPosts.map((post) => (
                            <article
                                key={post.id}
                                className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="p-5 border-b border-slate-600/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700/40 flex items-center justify-center flex-shrink-0">
                                            <span className="font-medium text-slate-300">
                                                {post.author.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-200">{post.author}</p>
                                                {post.type === 'lomba' ? (
                                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full flex items-center gap-1">
                                                        <Trophy className="w-3 h-3" /> Lomba
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full flex items-center gap-1">
                                                        <GraduationCap className="w-3 h-3" /> Beasiswa
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500">{post.timestamp}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">
                                    {post.title && <h3 className="font-bold text-slate-200 mb-2">{post.title}</h3>}
                                    <p className="text-slate-300 mb-4">{post.content}</p>

                                    {post.image && (
                                        <img
                                            src={post.image}
                                            alt={post.title || 'Post'}
                                            className="w-full rounded-lg object-cover max-h-72 mb-4"
                                        />
                                    )}

                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-5">
                                            {post.tags.map((tag, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-slate-700/40 text-slate-300 text-xs rounded-full">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-5 pt-3 border-t border-slate-600/30 mb-5 relative">
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors group relative"
                                            aria-label="Suka"
                                        >
                                            <div id={`heart-${post.id}`} className="relative">
                                                <Heart className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm">{post.likes}</span>
                                        </button>

                                        <button
                                            onClick={() => toggleComments(post.id)}
                                            className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
                                            aria-label="Komentar"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="text-sm">{post.comments.length}</span>
                                        </button>

                                        <button
                                            onClick={() => toggleShare(post.id)}
                                            className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors"
                                            aria-label="Bagikan"
                                        >
                                            <Share2 className="w-5 h-5" />
                                            <span className="text-sm">Bagikan</span>
                                        </button>

                                        {/* Share Popup */}
                                        {openShares.has(post.id) && (
                                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-20">
                                                <div className="bg-slate-800/90 backdrop-blur-md rounded-lg shadow-xl border border-slate-600/40 p-3 w-60">
                                                    <p className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1">
                                                        <LinkIcon className="w-3 h-3 text-slate-500" /> Salin Tautan
                                                    </p>
                                                    <button
                                                        onClick={() => copyLink(post.id)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-left text-xs mb-2"
                                                    >
                                                        <Copy className="w-3 h-3 text-slate-400" />
                                                        Salin URL
                                                    </button>
                                                    <p className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1">
                                                        <MessageSquareIcon className="w-3 h-3 text-slate-500" /> Bagikan ke
                                                    </p>
                                                    <button
                                                        onClick={() => shareToWhatsApp(post.id)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 bg-green-700/80 hover:bg-green-600 text-white rounded-md text-left text-xs"
                                                    >
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                        </svg>
                                                        WhatsApp
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Komentar Section */}
                                    {openComments.has(post.id) && (
                                        <div className="pt-4 border-t border-slate-600/30 mt-4">
                                            <div className="flex gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-slate-700/40 flex items-center justify-center flex-shrink-0">
                                                    <span className="font-medium text-slate-300 text-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <input
                                                    id={`comment-input-${post.id}`}
                                                    type="text"
                                                    placeholder="Tulis komentar..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const input = e.target as HTMLInputElement;
                                                            handleCommentSubmit(post.id, input.value);
                                                        }
                                                    }}
                                                    className="flex-1 px-3 py-2 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const input = document.getElementById(`comment-input-${post.id}`) as HTMLInputElement | null;
                                                        if (input) handleCommentSubmit(post.id, input.value);
                                                    }}
                                                    className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                                                    title="Kirim"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                                {post.comments.length === 0 ? (
                                                    <p className="text-slate-500 text-sm italic">Belum ada komentar.</p>
                                                ) : (
                                                    post.comments.map((comment) => (
                                                        <div key={comment.id} className="flex gap-3">
                                                            <div className="w-7 h-7 rounded-full bg-slate-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <span className="font-medium text-slate-300 text-xs">
                                                                    {comment.author.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 bg-slate-800/20 rounded-lg p-3">
                                                                <p className="font-medium text-slate-200 text-sm">{comment.author}</p>
                                                                <p className="text-slate-300 text-sm mt-1">{comment.text}</p>
                                                                <p className="text-slate-500 text-xs mt-1">{comment.timestamp}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
