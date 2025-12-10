// src/components/GroupView.tsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthProvider';
import { db } from '../../firebase';
import {
  collection,
  query,
  doc,
  getDoc,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { Search, MoreVertical, Send, Paperclip, Smile, ArrowLeft } from 'lucide-react';

interface Group {
  id: string; // ini communityId
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  memberCount: number;
}

interface GroupMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: any;
}

export default function GroupView() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Scroll otomatis
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔁 Muat daftar komunitas yang diikuti user
  useEffect(() => {
    if (!user) return;

    const loadCommunities = async () => {
  try {
    // Ambil semua keanggotaan user
    const membershipQuery = query(
      collection(db, 'memberships'),
      where('user_id', '==', user.id)
    );
    const membershipSnap = await getDocs(membershipQuery);
    const communityIds = membershipSnap.docs.map(doc => doc.data().community_id);

    if (communityIds.length === 0) {
      setGroups([]);
      return;
    }

    // Ambil data komunitas berdasarkan document ID
    const communityDocs = await Promise.all(
      communityIds.map(id => getDoc(doc(db, 'communities', id)))
    );

    // Bangun daftar grup
    const groupList: Group[] = communityDocs
      .filter(doc => doc.exists()) // hanya yang ditemukan
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Komunitas',
          lastMessage: 'Gabung untuk diskusi',
          time: '',
          unread: 0,
          memberCount: data.members_count || 0,
        };
      });

    setGroups(groupList);
  } catch (err) {
    console.error('Gagal muat komunitas:', err);
  }
};

    loadCommunities();
  }, [user]);

  // 🔁 Muat pesan grup saat pilih komunitas
  useEffect(() => {
    if (!selectedGroup) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'group_messages'),
      where('community_id', '==', selectedGroup.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: GroupMessage[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as GroupMessage[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedGroup]);

  // ✉️ Kirim pesan ke grup
  const handleSend = async () => {
    if (!user || !selectedGroup || !message.trim()) return;

    try {
      await addDoc(collection(db, 'group_messages'), {
        community_id: selectedGroup.id,
        sender_id: user.id,
        sender_name: user.name,
        content: message.trim(),
        timestamp: serverTimestamp(),
      });
      setMessage('');
    } catch (err) {
      console.error('Gagal kirim pesan grup:', err);
      alert('Gagal mengirim pesan.');
    }
  };

  // 🕒 Format waktu
  const formatTime = (ts: any) => {
    if (!ts?.toDate) return 'Baru saja';
    return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-120px)] max-md:h-[calc(100vh-180px)] bg-slate-800/30 border border-slate-600/30 rounded-xl overflow-hidden">
      {/* Sidebar List */}
      <div className={`${selectedGroup ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-slate-600/30`}>
        <div className="p-4 border-b border-slate-600/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Cari grup..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {groups.length === 0 ? (
                <div className="p-4 text-center text-slate-500">Belum ada komunitas.</div>
            ) : (
                groups
                .filter(group =>
                    group.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
                )
                .map((group) => (
                    <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 transition-colors ${
                        selectedGroup?.id === group.id ? 'bg-slate-700/40' : ''
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
                ))
            )}
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
                <ArrowLeft />
              </button>
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                <span className="font-bold text-slate-300">{selectedGroup.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-200">{selectedGroup.name}</h3>
                <p className="text-xs text-slate-400">{selectedGroup.memberCount} Anggota</p>
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

            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0"></div>
                <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-400">{msg.sender_name}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{msg.content}</p>
                  <span className="text-xs text-slate-500 mt-1 block">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
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
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-full text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
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