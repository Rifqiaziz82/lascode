import { Search, UserPlus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, getDoc, doc, setDoc,arrayUnion, query, where, limit } from 'firebase/firestore';
import { useAuth } from '../AuthProvider';


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
    const { user } = useAuth();
    const [suggestedUsers, setSuggestedUsers] = useState<{ id: string; name: string; role: string; avatar: string }[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
  const loadSuggestedUsers = async () => {
    if (!user) return;

    try {
      // Ambil user lain (bukan diri sendiri), maks 3
      const q = query(
        collection(db, 'users'),
        where('id', '!=', user.id),
        limit(3)
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'User',
          role: data.role || 'Member', // pastikan field 'role' ada di Firestore
          avatar: data.name?.charAt(0).toUpperCase() || 'U',
        };
      });
      setSuggestedUsers(users);
    } catch (err) {
      console.error('Gagal muat saran user:', err);
    }
  };

  loadSuggestedUsers();
}, [user]);

const followUser = async (userIdToFollow: string) => {
  if (!user) {
    // Opsional: arahkan ke login
    return;
  }

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
        <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            <div className='sticky top-24 ' >
            {/* Popular Searches */}
            <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 p-5 ">
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
            <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 p-5 mt-4">
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
                            <button onClick={(e) => {
                                e.stopPropagation(); // cegah trigger navigate
                                followUser(user.id);}} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors" title="Ikuti">
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
        </div>
    );
}
