import { UserPlus, TrendingUp, Sparkles, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, getDoc, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../AuthProvider';
import { motion } from 'framer-motion';

interface ForumRightSidebarProps {
    onSearch: (query: string) => void;
    onSearchClick?: () => void;
}

interface FirestoreUser {
  id: string;
  name?: string;
  role?: string;
}

const popularSearches = [
    "Lomba Desain 2024",
    "Beasiswa S2 Full",
    "Magang BUMN",
    "Webinar Gratis",
    "Lomba Coding",
    "Beasiswa KIP Kuliah"
];

export default function ForumRightSidebar({ onSearch, onSearchClick }: ForumRightSidebarProps) {
    const { user } = useAuth();
    const [suggestedUsers, setSuggestedUsers] = useState<{ id: string; name: string; role: string; avatar: string }[]>([]);
    const navigate = useNavigate();

   useEffect(() => {
  const loadSuggestedUsers = async () => {
    if (!user) return;

    try {
      const snapshot = await getDocs(collection(db, 'users'));
      
      const allUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))as FirestoreUser[];

      const others = allUsers
        .filter(u => u.id !== user.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const formatted = others.map(u => ({
        id: u.id,
        name: u.name || 'User',
        role: u.role || 'Member',
        avatar: (u.name?.charAt(0) || 'U').toUpperCase(),
      }));

      setSuggestedUsers(formatted);
    } catch (err) {
      console.error('Gagal muat saran user:', err);
    }
  };

  loadSuggestedUsers();
}, [user]);

const followUser = async (userIdToFollow: string) => {
  if (!user) return;

  try {
    const friendDoc = await getDoc(doc(db, 'friends', user.id));
    let friendIds: string[] = [];
    if (friendDoc.exists()) {
      friendIds = friendDoc.data().friends || [];
    }

    if (friendIds.includes(userIdToFollow)) {
      alert('Sudah mengikuti user ini.');
      return;
    }

    await setDoc(
      doc(db, 'friends', user.id),
      { friends: arrayUnion(userIdToFollow) },
      { merge: true }
    );

    alert('Berhasil mengikuti!');
  } catch (err) {
    console.error('Gagal mengikuti:', err);
    alert('Gagal mengikuti user.');
  }
};

    const handleSearchClick = (term: string) => {
        onSearch(term);
        if (onSearchClick) {
            onSearchClick();
        }
    };

    return (
        <div className="hidden lg:block flex-shrink-0 space-y-6">
            <div className='sticky top-24 space-y-6'>
            
            {/* Popular Searches with Gradient Border */}
            <div className="relative group rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/30 to-blue-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded-2xl blur-sm group-hover:blur-md transition-all"/>
                <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-sm font-bold text-slate-200">Sedang Trending</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {popularSearches.map((term, index) => (
                            <button
                                key={index}
                                onClick={() => handleSearchClick(term)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-lg text-xs font-medium text-slate-300 transition-all text-left hover:text-white hover:shadow-lg hover:shadow-blue-500/10"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Suggested Users */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        
                        <h2 className="text-sm font-bold text-slate-200">Saran Teman</h2>
                    </div>
                </div>
                <div className="space-y-4">
                    {suggestedUsers.map((u, i) => (
                         <motion.div 
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.1 }}
                           key={u.id} 
                           className="flex items-center justify-between group"
                         >
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => navigate(`/user/${u.id}`)}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/30 overflow-hidden">
                                        <span className="font-bold text-xs text-slate-300">{u.avatar}</span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-200 text-xs group-hover:text-blue-400 transition-colors">{u.name}</p>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                       <Shield size={10} /> {u.role}
                                    </p>
                                </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                followUser(u.id);
                              }} 
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors" 
                              title="Ikuti"
                            >
                                <UserPlus className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
                <button className="w-full mt-4 py-2.5 text-xs font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors border border-slate-600/30">
                    Lihat Semua
                </button>
            </div>
            
            </div>
        </div>
    );
}
