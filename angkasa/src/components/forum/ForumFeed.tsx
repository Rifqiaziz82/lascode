// src/components/ForumFeed.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../AuthProvider';
import { Search, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ref, onValue, update, get, push, set, serverTimestamp } from 'firebase/database';
import { rtdb } from '../../firebase';
import PostCard, { type Post } from './PostCard';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState<(typeof availableTypes)[number] | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'rekomendasi' | 'following'>('rekomendasi');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const postsRef = ref(rtdb, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const postsArray: Post[] = Object.keys(data).map((key) => ({
          id: key,
          author: data[key].author || 'Admin',
          avatar: data[key].avatar || '',
          content: data[key].content || '',
          image: data[key].image || '',
          likes: data[key].likes || 0,
          comments: data[key].comments || {},
          timestamp: data[key].timestamp || new Date().toISOString(),
          category: data[key].category || 'lomba',
          title: data[key].title || '',
          type: data[key].type || 'lomba',
          tags: Array.isArray(data[key].tags) ? data[key].tags : [],
          registrationLink: data[key].registrationLink || '#',
          eventDate: data[key].eventDate || new Date().toISOString(),
          closingDate: data[key].closingDate || new Date().toISOString(),
          likedBy: data[key].likedBy || {},
        }));

        postsArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const handleLike = async (postId: string) => {
    if (!user?.id) return;

    const postRef = ref(rtdb, `posts/${postId}`);
    const snapshot = await get(postRef);
    if (!snapshot.exists()) return;

    const postData = snapshot.val();
    const likedBy = postData.likedBy || {};
    const isLiked = likedBy[user.id] === true;

    let newLikes = postData.likes || 0;
    const updates: Record<string, any> = {};

    if (isLiked) {
      newLikes = Math.max(0, newLikes - 1);
      updates[`likedBy/${user.id}`] = null;
    } else {
      newLikes += 1;
      updates[`likedBy/${user.id}`] = true;
    }

    updates.likes = newLikes;
    await update(postRef, updates);
  };

  const handleCommentSubmit = async (postId: string, commentText: string) => {
    if (!commentText.trim() || !user?.id) return;

    const commentsRef = ref(rtdb, `posts/${postId}/comments`);
    const newCommentRef = push(commentsRef);
    await set(newCommentRef, {
      id: newCommentRef.key!,
      author: user.name || 'Anonymous',
      authorId: user.id,
      text: commentText.trim(),
      timestamp: serverTimestamp() as unknown as string,
    });
  };

  const handleReplySubmit = async (postId: string, replyText: string, parentId: string) => {
    if (!replyText.trim() || !user?.id) return;

    const commentsRef = ref(rtdb, `posts/${postId}/comments`);
    const newCommentRef = push(commentsRef);
    await set(newCommentRef, {
      id: newCommentRef.key!,
      author: user.name || 'Anonymous',
      authorId: user.id,
      text: replyText.trim(),
      timestamp: serverTimestamp() as unknown as string,
      parentId,
    });
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

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-4 text-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-400">Sedang memuat feed...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-4 space-y-6">
      {/* Search & Filter Header */}
      <section className="sticky top-20 z-10 glass-nav rounded-2xl p-2 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 shadow-xl" ref={searchRef}>
          <div className="relative">
             <div className="flex items-center gap-2">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Cari beasiswa, lomba, atau teman diskusi..." 
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all focus:bg-slate-900/80"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchOpen(true)}
                    />
                 </div>
                 <button 
                   onClick={() => setIsSearchOpen(!isSearchOpen)}
                   className={`p-2.5 rounded-xl border border-slate-700/50 transition-all ${isSearchOpen || selectedType || selectedCategory ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}
                 >
                   <SlidersHorizontal className="w-4 h-4" />
                 </button>
             </div>

             {/* Expanded Filter Panel */}
             {(isSearchOpen || selectedType || selectedCategory) && (
               <div className="mt-3 p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipe</label>
                       <div className="flex gap-2">
                         {['', 'lomba', 'beasiswa'].map(type => (
                           <button
                             key={type}
                             onClick={() => setSelectedType(type as any)}
                             className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${selectedType === type 
                               ? 'bg-blue-600 border-blue-500 text-white font-medium' 
                               : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                           >
                             {type === '' ? 'Semua' : type.charAt(0).toUpperCase() + type.slice(1)}
                           </button>
                         ))}
                       </div>
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Topik</label>
                       <select 
                         value={selectedCategory} 
                         onChange={(e) => setSelectedCategory(e.target.value)}
                         className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                       >
                         <option value="">Semua Topik</option>
                         {availableCategories.map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                         ))}
                       </select>
                     </div>
                  </div>
               </div>
             )}
          </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-800 pb-1">
        {[
          { key: 'rekomendasi', label: 'Untuk Anda', icon: Sparkles },
          { key: 'following', label: 'Mengikuti', icon: Filter },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-1 pb-3 text-sm font-medium border-b-2 transition-colors relative ${
              activeTab === tab.key
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <tab.icon className={activeTab === tab.key ? "w-4 h-4 text-blue-400" : "w-4 h-4 text-slate-500"} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="space-y-6 min-h-[50vh]">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
               <Search className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-slate-300 font-semibold text-lg">Tidak ada hasil ditemukan</h3>
            <p className="text-slate-500 max-w-sm mt-2">Coba ubah kata kunci pencarian atau filter Anda untuk menemukan hasil yang lebih banyak.</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedType(''); setSelectedCategory('');}}
              className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
            >
              Hapus Filter
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={user} 
              onLike={handleLike}
              onCommentSubmit={handleCommentSubmit}
              onReplySubmit={handleReplySubmit}
            />
          ))
        )}
      </div>
    </div>
  );
}
