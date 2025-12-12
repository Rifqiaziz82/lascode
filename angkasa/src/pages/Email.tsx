
import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import {
  Inbox,
  CheckCircle,
  Paperclip,
  Search,
  Star,
  Trophy,
  Medal,
  Play,
  ChevronRight
} from "lucide-react";
import Particles from "../components/Particles";
import { motion, AnimatePresence } from "framer-motion";

import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

// Interface untuk Email dari Firestore
interface EmailMessage {
  id: string;
  recipientId: string;
  subject: string;
  senderName: string;
  preview: string;
  content: string;
  time: any; // Firestore Timestamp
  read: boolean;
  starred: boolean;
  type?: 'message' | 'certificate';
  attachments?: number;
  certificate?: any;
}

export default function Email() {
  const { user, isAudioPlaying, togglePlay } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inbox" | "starred" | "accepted">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Use type assertion to handle User interface variations
    const userId = (user as any).uid || (user as any).id;

    const q = query(
      collection(db, 'emails'), 
      where('recipientId', '==', userId),
      orderBy('time', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emailList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmailMessage[];
      
      setEmails(emailList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching emails:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Format Time Helper
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Jika hari ini
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    // Jika kemarin
    if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
      return 'Kemarin';
    }
    // Sisanya tanggal
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // Filter Logic
  const filteredEmails = emails.filter(email => {
    // Basic Tab Filter
    let matchesTab = false;
    if (activeTab === "inbox") matchesTab = true; // Show all in inbox? Or exclude certs? Let's show all.
    if (activeTab === "starred") matchesTab = email.starred;
    if (activeTab === "accepted") matchesTab = email.type === 'certificate';

    // Search Filter
    const matchesSearch = 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Derived Accepted Certificates (for stats count)
  const acceptedCertificates = emails.filter(e => e.type === 'certificate').map(e => ({
    id: e.id,
    title: e.certificate?.title || e.subject,
    issuer: e.certificate?.issuer || e.senderName,
    date: e.certificate?.date || formatTime(e.time),
    badge: e.certificate?.badge || 'Certificate',
    icon: e.certificate?.icon || 'medal',
    file: e.certificate?.imageUrl,
  }));

  // Reset pencarian saat ganti tab
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
         <Particles 
            particleCount={80} 
            particleSpread={10} 
            speed={0.1} 
            particleColors={['#60a5fa', '#a78bfa']}
            moveParticlesOnHover={true}
            particleHoverFactor={2}
            alphaParticles={true}
            particleBaseSize={100}
            sizeRandomness={1}
            cameraDistance={20}
            disableRotation={false}
         />
      </div>

      <DashboardHeader />

      {/* Music Control - Floating */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={togglePlay}
          className="group flex items-center gap-3 pr-5 pl-3 py-3 bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-full shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
          title={isAudioPlaying ? 'Jeda musik' : 'Putar musik'}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
             {isAudioPlaying ? (
                <div className="flex gap-1 items-end h-4">
                  <span className="w-1 bg-white h-2 animate-music-bar-1"></span>
                  <span className="w-1 bg-white h-4 animate-music-bar-2"></span>
                  <span className="w-1 bg-white h-3 animate-music-bar-3"></span>
                </div>
             ) : (
                <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
             )}
          </div>
          <div className="flex flex-col text-left">
             <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Ambient Lo-Fi</span>
             <span className="text-[10px] text-slate-400">{isAudioPlaying ? 'Playing' : 'Paused'}</span>
          </div>
        </button>
      </div>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-28 pb-12">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Kotak Masuk</h1>
            <p className="text-slate-400">Kelola pesan dan notifikasi sertifikat Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden sticky top-24 shadow-xl">
              <div className="p-4 border-b border-slate-700/50 bg-slate-900/20">
                <h2 className="font-semibold text-slate-200 text-sm uppercase tracking-wider">Navigasi</h2>
              </div>
              <nav className="p-2 space-y-1">
                {[
                  { id: "inbox", label: "Kotak Masuk", icon: Inbox, count: emails.length },
                  { id: "starred", label: "Pentaingan", icon: Star, count: emails.filter(e => e.starred).length },
                  { id: "accepted", label: "Sertifikat", icon: CheckCircle, count: acceptedCertificates.length },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.count > 0 && (
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Konten */}
          <div className="lg:col-span-9">
             <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden min-h-[600px]">
                {/* Search Header */}
                <div className="p-4 border-b border-slate-700/50 flex items-center justify-between gap-4 bg-slate-900/20">
                   {activeTab !== "accepted" ? (
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari pesan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all focus:bg-slate-900/80"
                        />
                    </div>
                   ) : (
                     <h3 className="font-semibold text-slate-200">Sertifikat Tersimpan</h3>
                   )}
                   
                   <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150"></div>
                   </div>
                </div>

                <div className="p-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                  <AnimatePresence mode="wait">
                    {activeTab === "accepted" ? (
                        <motion.div 
                          key="accepted"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3 p-2"
                        >
                        {acceptedCertificates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-slate-300 font-medium mb-1">Belum ada sertifikat</h3>
                                <p className="text-slate-500 text-sm max-w-xs">Sertifikat yang Anda terima akan muncul di sini.</p>
                            </div>
                        ) : (
                            acceptedCertificates.map((cert) => (
                            <div
                                key={cert.id}
                                onClick={() => navigate(`/email/accepted/${cert.id}`)}
                                className="group relative bg-slate-800/30 hover:bg-slate-700/40 rounded-xl border border-slate-700/30 p-4 cursor-pointer transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${
                                        cert.icon === 'trophy' ? 'bg-amber-500/10 text-amber-500' : 
                                        cert.icon === 'medal' ? 'bg-blue-500/10 text-blue-500' : 
                                        'bg-purple-500/10 text-purple-500'
                                    }`}>
                                        {cert.icon === "trophy" ? <Trophy className="w-6 h-6" /> : 
                                         cert.icon === "medal" ? <Medal className="w-6 h-6" /> : 
                                         <Star className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-green-500/20">
                                                Terverifikasi
                                            </span>
                                            <span className="text-xs text-slate-500">• {cert.date}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-100 group-hover:text-white transition-colors">{cert.title}</h3>
                                        <p className="text-slate-400 text-sm mt-0.5">{cert.issuer}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </div>
                            ))
                        )}
                        </motion.div>
                    ) : (
                        <motion.div 
                          key="inbox"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-1"
                        >
                        {filteredEmails.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                    <Inbox className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-slate-300 font-medium mb-1">Kotak masuk kosong</h3>
                                <p className="text-slate-500 text-sm max-w-xs">Tidak ada pesan yang ditemukan.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/50">
                            {filteredEmails.map((email) => (
                                <div
                                key={email.id}
                                onClick={() => navigate(`/email/${email.id}`)}
                                className={`group p-4 hover:bg-slate-700/30 transition-all cursor-pointer rounded-lg mx-2 my-1 ${
                                    !email.read ? "bg-slate-800/60" : ""
                                }`}
                                >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!email.read ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-transparent'}`} />
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-4 mb-1">
                                            <h4 className={`text-sm truncate ${!email.read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                                                {email.senderName}
                                            </h4>
                                            <span className={`text-xs whitespace-nowrap ${!email.read ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>
                                                {formatTime(email.time)}
                                            </span>
                                        </div>
                                        <h3 className={`text-base truncate mb-1 ${!email.read ? 'font-bold text-slate-100' : 'text-slate-300'}`}>
                                            {email.subject}
                                        </h3>
                                        <p className="text-slate-400 text-sm line-clamp-1">
                                            {email.preview}
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2 text-slate-500">
                                        {email.starred && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                                        {email.attachments && email.attachments > 0 ? <Paperclip className="w-4 h-4" /> : null}
                                    </div>
                                </div>
                                </div>
                            ))}
                            </div>
                        )}
                        </motion.div>
                    )}
                  </AnimatePresence>
                  )}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}