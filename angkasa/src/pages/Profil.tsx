// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import DashboardHeader from "../components/DashboardHeader";
import {
  Camera,
  Trophy,
  Award,
  Star,
  Medal,
  HelpCircle,
  Settings,
  FileText,
  LogOut,
  X,
  Sparkles as SparklesIcon,
  Crown,
  Share2,
  Calendar,
  Play,
  ChevronRight,
  CheckCircle,
  Eye,
  TrendingUp,
  Instagram,
  Youtube,
  Twitch
} from "lucide-react";
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Particles from '../components/Particles';
import { motion, AnimatePresence } from 'framer-motion';

interface Certificate {
  id: string;
  title: string;
  competition_name: string;
  verified: boolean;
  image_url?: string;
  timing?: string;
  listens?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_count: number;
  requirement_type: string;
  is_unlocked?: boolean;
}

const mockAchievements: Achievement[] = [
  {
    id: "ach-001",
    name: "Pendatang Baru",
    description: "Bergabung dengan Angkasa",
    icon: "Star",
    requirement_count: 1,
    requirement_type: "join",
    is_unlocked: true,
  },
  {
    id: "ach-002",
    name: "Juara 1",
    description: "Menangkan 1 Lomba",
    icon: "Trophy",
    requirement_count: 1,
    requirement_type: "win",
    is_unlocked: false,
  },
  {
    id: "ach-003",
    name: "Aktif",
    description: "Login 7 hari berturut-turut",
    icon: "Award",
    requirement_count: 7,
    requirement_type: "login",
    is_unlocked: false,
  }
];

export default function Profile() {
  const { user, updateProfile, logout, isAudioPlaying, togglePlay } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("Siswa");
  const [experience, setExperience] = useState("Intermediate");
  const [city, setCity] = useState("Jakarta, Indonesia");
  const [tags, setTags] = useState("#Sains #Matematika #Robotik");
  
  // Custom Fields (School/University)
  const [institution, setInstitution] = useState("");

  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievements] = useState<Achievement[]>(mockAchievements);

  // State for Modals
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  /* Help Modal State */
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [reportIssue, setReportIssue] = useState('');
  const [reportCategory, setReportCategory] = useState('General');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [myReports, setMyReports] = useState<any[]>([]);

  // Enhanced Profile Features
  const [profileViews] = useState(127); // TODO: Track real views
  const [completionScore, setCompletionScore] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // Photo Upload States
  const [bannerPhoto, setBannerPhoto] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
        if (showHelpModal && user) {
             const q = query(collection(db, 'reports'), where('uid', '==', user.id));
             getDocs(q).then(snap => {
                 const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                 setMyReports(data);
             });
        }
    }, [showHelpModal, user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadProfileData = async () => {
      try {
        // Isi dari user
        setName(user.name || "");
        setEmail(user.email || "");
        setBio(user.bio || "");
        setRole(user.role || "Siswa");
        setExperience(user.experience_level || "Intermediate");
        setCity(user.city_region || "Jakarta, Indonesia");
        setTags((user.tags || []).join(" "));
        setInstitution(user.institution || "");
        setBannerPhoto(user.banner_photo || "");
        setProfilePhoto(user.profile_photo || "");
        
        const sm = user.social_media || {};
        setInstagram(sm.instagram || "");
        setYoutube(sm.youtube || "");
        setTiktok(sm.tiktok || "");

        // Muat sertifikat
        const q = query(
          collection(db, 'certificates'),
          where('user_id', '==', user.id),
          where('public', '==', true)
        );
        const snapshot = await getDocs(q);
        const certs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Certificate[];
        setCertificates(certs);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user, navigate]);

  // Calculate completion score
  useEffect(() => {
    const fields = [name, bio, institution, city, role, experience, tags, instagram, youtube, tiktok];
    const filled = fields.filter(f => f && String(f).trim().length > 0).length;
    const hasCerts = certificates.length > 0;
    const score = Math.round(((filled + (hasCerts ? 1 : 0)) / (fields.length + 1)) * 100);
    setCompletionScore(score);
  }, [name, bio, institution, city, role, experience, tags, instagram, youtube, tiktok, certificates]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        email,
        bio,
        role,
        experience_level: experience,
        city_region: city,
        institution,
        tags: tags.split(" ").filter(Boolean),
        social_media: { instagram, youtube, tiktok },
      });
      alert("✅ Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("❌ Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Banner Photo Upload Handler
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("❌ Ukuran file terlalu besar. Maksimal 2MB");
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert("❌ File harus berupa gambar");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setBannerPhoto(dataUrl);
      try {
        await updateProfile({ banner_photo: dataUrl });
        alert("✅ Banner berhasil diubah!");
      } catch (error) {
        console.error(error);
        alert("❌ Gagal menyimpan banner");
      }
    };
    reader.readAsDataURL(file);
  };

  // Profile Photo Upload Handler
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      alert("❌ Ukuran file terlalu besar. Maksimal 1MB");
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert("❌ File harus berupa gambar");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
      try {
        await updateProfile({ profile_photo: dataUrl });
        alert("✅ Foto profil berhasil diubah!");
      } catch (error) {
        console.error(error);
        alert("❌ Gagal menyimpan foto profil");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteBanner = async () => {
    if (!confirm("Yakin ingin menghapus banner?")) return;
    try {
      setBannerPhoto("");
      await updateProfile({ banner_photo: "" });
      alert("✅ Banner berhasil dihapus!");
    } catch (error) {
      console.error(error);
      alert("❌ Gagal menghapus banner");
    }
  };

  const handleDeleteProfilePhoto = async () => {
    if (!confirm("Yakin ingin menghapus foto profil?")) return;
    try {
      setProfilePhoto("");
      await updateProfile({ profile_photo: "" });
      alert("✅ Foto profil berhasil dihapus!");
    } catch (error) {
      console.error(error);
      alert("❌ Gagal menghapus foto profil");
    }
  };


  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Trophy": return <Trophy className="w-5 h-5" />;
      case "Award": return <Award className="w-5 h-5" />;
      case "Star": return <Star className="w-5 h-5" />;
      case "Medal": return <Medal className="w-5 h-5" />;
      case "FileText": return <FileText className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };


    const handleSendReport = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const currentUser = auth.currentUser;
        const uid = user?.id || currentUser?.uid;

        if (!uid) {
            alert("Error: User ID not found. Please reload the page.");
            return;
        }

        setIsSubmittingReport(true);
        try {
            const newReport = {
                uid: uid, 
                email: user?.email || currentUser?.email || 'Unknown',
                issue: reportIssue,
                category: reportCategory,
                description: reportDescription,
                status: 'Baru',
                reply: '',
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            };
            
            const docRef = await addDoc(collection(db, 'reports'), newReport);
            
            setMyReports(prev => [{id: docRef.id, ...newReport}, ...prev]);

            setShowHelpModal(false);
            alert('✅ Laporan berhasil dikirim!');
            setReportIssue('');
            setReportDescription('');
        } catch (err: any) {
            console.error("Error sending report:", err);
            alert(`Gagal mengirim laporan: ${err.message || err}`);
        } finally {
            setIsSubmittingReport(false);
        }
    };

    if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
       {/* Background Particles */}
       <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
         <Particles 
            particleCount={60} 
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
      <div className="fixed bottom-10 sm:bottom-6 left-6 z-50">
        <button
          onClick={togglePlay}
          className="group flex items-center gap-0 sm:gap-3 p-0 sm:pr-5 sm:pl-3 sm:py-3 transition-all duration-300"
          title={isAudioPlaying ? 'Jeda musik' : 'Putar musik'}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
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
        </button>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-32 pb-12 max-w-7xl">
        {/* Banner/Header */}
        <div className="relative rounded-3xl overflow-hidden h-48 md:h-64 mb-16 bg-gradient-to-r from-blue-900 via-purple-900 to-slate-900">
             {bannerPhoto ? (
                <img 
                  src={bannerPhoto} 
                  alt="Banner" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
             ) : (
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
             )}
             <div className="absolute bottom-4 right-4 flex gap-2">
                  <input
                    type="file"
                    id="banner-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                  <label
                    htmlFor="banner-upload"
                    className="p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-lg text-white transition-colors cursor-pointer"
                    title="Ubah Banner"
                  >
                      <Camera className="w-5 h-5" />
                  </label>
                  {bannerPhoto && (
                    <button
                      onClick={handleDeleteBanner}
                      className="p-2 bg-red-600/80 hover:bg-red-600 backdrop-blur-sm rounded-lg text-white transition-colors"
                      title="Hapus Banner"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
             </div>
        </div>

        {/* Profile Info Overlay in Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-24 px-4">
           {/* Left Sidebar (Profile Card) */}
           <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-18 shadow-2xl relative overflow-hidden">
                   <div className="relative flex flex-col items-center mb-4">
                        <div className="relative">
                            {/* Completion Ring */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 136 136">
                                <circle
                                    cx="68"
                                    cy="68"
                                    r="66"
                                    fill="none"
                                    stroke="rgba(71, 85, 105, 0.3)"
                                    strokeWidth="4"
                                />
                                <motion.circle
                                    cx="68"
                                    cy="68"
                                    r="66"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 66}`}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 66 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 66 * (1 - completionScore / 100) }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            
                            <div className="w-32 h-32 rounded-full bg-slate-800 p-1 border-4 border-slate-800 shadow-xl overflow-hidden">
                                {profilePhoto ? (
                                  <img 
                                    src={profilePhoto} 
                                    alt={name} 
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                                      {name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                            </div>
                            <input
                              type="file"
                              id="profile-photo-upload"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProfilePhotoUpload}
                            />
                            <label
                              htmlFor="profile-photo-upload"
                              className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg border-2 border-slate-800 transition-colors cursor-pointer"
                              title="Ubah Foto Profil"
                            >
                                <Camera className="w-4 h-4" />
                            </label>
                            {profilePhoto && (
                              <button
                                onClick={handleDeleteProfilePhoto}
                                className="absolute bottom-1 left-1 p-2 bg-red-600 hover:bg-red-500 rounded-full text-white shadow-lg border-2 border-slate-800 transition-colors"
                                title="Hapus Foto Profil"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mt-4 text-center">{name}</h2>
                        <div className="flex items-center gap-2 text-slate-400 mt-1">
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-bold uppercase tracking-wider border border-blue-500/20">{role}</span>
                            <span className="text-sm">• {city}</span>
                        </div>
                   </div>

                   <div className="space-y-4 pt-4 border-t border-slate-700/50">
                        <div className="flex justify-between items-center py-2">
                             <span className="text-slate-400 text-sm">Experience</span>
                             <span className="text-white font-medium text-sm">{experience}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                             <span className="text-slate-400 text-sm">Bergabung</span>
                             <span className="text-white font-medium text-sm">Des 2024</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {tags.split(" ").filter(Boolean).map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">{tag}</span>
                            ))}
                        </div>
                   </div>

                   <div className="mt-6 flex gap-3">
                        <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-all text-sm">
                            Edit Profil
                        </button>
                        <button className="p-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl border border-slate-600/50 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                   </div>
               </div>
               {/* Achievements Widget */}
               <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-xl">
                   <div className="flex items-center justify-between mb-4">
                       <h3 className="font-bold text-white flex items-center gap-2">
                           <Crown className="w-5 h-5 text-amber-500" /> Pencapaian
                       </h3>
                       <button className="text-xs text-blue-400 hover:text-blue-300">Lihat Semua</button>
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                       {achievements.map((ach) => {
                           const Icon = getIcon(ach.icon);
                           return (
                               <div key={ach.id} className="flex flex-col items-center gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-700/30 group hover:border-blue-500/30 transition-colors">
                                   <div className={`p-2 rounded-full ${ach.is_unlocked ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-700/50 text-slate-500'}`}>
                                       {Icon}
                                   </div>
                                   <span className="text-[10px] text-slate-400 text-center line-clamp-1 group-hover:text-amber-200">{ach.name}</span>
                               </div>
                           );
                       })}
                   </div>
               </div>

               {/* Menu Widget */}
               <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-4 shadow-xl divide-y divide-slate-700/50">
                    <button className="w-full flex items-center justify-between p-3 text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-xl transition-colors"> 
                       <span className="flex items-center gap-3 font-medium text-sm"><Settings className="w-4 h-4" /> Pengaturan</span>
                       <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                    <button 
                      onClick={() => setShowHelpModal(true)}
                      className="w-full flex items-center justify-between p-3 text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-xl transition-colors"
                    > 
                       <span className="flex items-center gap-3 font-medium text-sm"><HelpCircle className="w-4 h-4" /> Bantuan & Laporan</span>
                       <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                    > 
                       <span className="flex items-center gap-3 font-medium text-sm"><LogOut className="w-4 h-4" /> Keluar</span>
                    </button>
               </div>
           </div>

           {/* Right Content (Tabs & Forms) */}
           <div className="lg:col-span-8 space-y-6">
               
               {/* About Me Section */}
               <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-xl">
                   <div className="flex items-center gap-2 mb-6">
                       <SparklesIcon className="w-5 h-5 text-blue-400" />
                       <h3 className="text-xl font-bold text-white">Tentang Saya</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                           <div>
                               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Nama Lengkap</label>
                               <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                           </div>
                           <div>
                               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Bio Singkat</label>
                               <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                           </div>
                       </div>
                       <div className="space-y-4">
                           <div>
                               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Institusi / Sekolah</label>
                               <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Contoh: SMA Negeri 1 Jakarta" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Kota</label>
                                    <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Level</label>
                                    <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Expert</option>
                                    </select>
                                </div>
                           </div>
                       </div>
                   </div>

                   <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-end">
                       <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2">
                           <CheckCircle className="w-4 h-4" />
                           {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                       </button>
                   </div>
               </div>

               {/* Social Media Showcase */}
               {(instagram || youtube || tiktok) && (
                   <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-xl">
                       <div className="flex items-center gap-2 mb-6">
                           <Share2 className="w-5 h-5 text-pink-400" />
                           <h3 className="text-xl font-bold text-white">Social Media</h3>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {instagram && (
                               <motion.a
                                   href={`https://instagram.com/${instagram.replace('@', '')}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   whileHover={{ scale: 1.02, y: -2 }}
                                   className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-colors"
                               >
                                   <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
                                       <Instagram className="w-5 h-5 text-white" />
                                   </div>
                                   <div>
                                       <p className="text-xs text-slate-400">Instagram</p>
                                       <p className="text-sm font-medium text-white">{instagram}</p>
                                   </div>
                               </motion.a>
                           )}
                           {youtube && (
                               <motion.a
                                   href={`https://youtube.com/@${youtube.replace('@', '')}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   whileHover={{ scale: 1.02, y: -2 }}
                                   className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-colors"
                               >
                                   <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                                       <Youtube className="w-5 h-5 text-white" />
                                   </div>
                                   <div>
                                       <p className="text-xs text-slate-400">YouTube</p>
                                       <p className="text-sm font-medium text-white">{youtube}</p>
                                   </div>
                               </motion.a>
                           )}
                           {tiktok && (
                               <motion.a
                                   href={`https://tiktok.com/@${tiktok.replace('@', '')}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   whileHover={{ scale: 1.02, y: -2 }}
                                   className="flex items-center gap-3 p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
                               >
                                   <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                                       <Twitch className="w-5 h-5 text-white" />
                                   </div>
                                   <div>
                                       <p className="text-xs text-slate-400">TikTok</p>
                                       <p className="text-sm font-medium text-white">{tiktok}</p>
                                   </div>
                               </motion.a>
                           )}
                       </div>
                   </div>
               )}

               {/* Portfolio Section */}
               <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-xl">
                     <div className="mb-6">
                         <div className="flex items-center gap-2 mb-2">
                             <Award className="w-5 h-5 text-purple-400" />
                             <h3 className="text-xl font-bold text-white">Portofolio & Sertifikat</h3>
                         </div>
                         <p className="text-sm text-slate-400">Sertifikat ditambahkan dari email terverifikasi</p>
                     </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {certificates.length === 0 ? (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-700/50 rounded-2xl">
                                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">Belum ada sertifikat</p>
                                <p className="text-slate-600 text-sm">Sertifikat dari email terverifikasi akan muncul di sini</p>
                            </div>
                        ) : (
                            certificates.map((cert) => (
                                <div key={cert.id} onClick={() => setSelectedCertificate(cert)} className="group relative aspect-[4/3] bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                                    <img src={cert.image_url || `https://via.placeholder.com/400x300?text=${cert.title}`} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-80" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <p className="text-white font-bold text-sm line-clamp-1">{cert.title}</p>
                                        <p className="text-slate-400 text-xs line-clamp-1">{cert.competition_name}</p>
                                    </div>
                                    {cert.verified && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                                            <CheckCircle className="w-3 h-3" /> Verified
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
               </div>
           </div>
        </div>
      </div>

      {/* FOOTER - Simple Version for Profile */}
        <footer className="relative bg-slate-900 border-t border-slate-800 pt-12 pb-8 mt-20">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">Angkasa</h3>
            <p className="text-slate-500 text-sm">Empowering Student Creativity & Achievement</p>
            <div className="mt-6 text-xs text-slate-600">
              &copy; {new Date().getFullYear()} Angkasa Platform. All rights reserved.
            </div>
          </div>
        </footer>

      {/* MODALS */}
      <AnimatePresence>
        {selectedCertificate && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCertificate(null)}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="relative bg-slate-900 rounded-2xl max-w-4xl w-full overflow-hidden border border-slate-700 shadow-2xl"
            >
                <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-2/3 bg-black flex items-center justify-center p-4">
                        <img 
                            src={selectedCertificate.image_url || "https://via.placeholder.com/600x400?text=No+Image"}
                            alt={selectedCertificate.title}
                            className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                    <div className="md:w-1/3 p-6 flex flex-col justify-between bg-slate-900 border-l border-slate-800">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{selectedCertificate.title}</h3>
                                    <p className="text-slate-400 text-sm">{selectedCertificate.competition_name}</p>
                                </div>
                                <button onClick={() => setSelectedCertificate(null)} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>
                            
                            <div className="space-y-4 mt-6">
                                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Tanggal</p>
                                        <p className="text-slate-300 text-sm">20 Oktober 2024</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <CheckCircle className={`w-5 h-5 ${selectedCertificate.verified ? 'text-green-400' : 'text-slate-500'}`} />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Status</p>
                                        <p className={`text-sm font-medium ${selectedCertificate.verified ? 'text-green-400' : 'text-slate-400'}`}>
                                            {selectedCertificate.verified ? 'Terverifikasi Resmi' : 'Menunggu Verifikasi'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-blue-900/20">
                                Bagikan
                            </button>
                            <button className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-medium text-sm border border-slate-700">
                                Unduh
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
      {showHelpModal && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <HelpCircle className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Bantuan & Laporan</h3>
                            <p className="text-slate-400 text-xs">Kami siap membantu kendala Anda</p>
                        </div>
                    </div>
                    <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 grid gap-8 md:grid-cols-2">
                    {/* New Report Form */}
                    <div className="space-y-5">
                        <h4 className="font-semibold text-blue-400 text-sm uppercase tracking-wider">Buat Laporan Baru</h4>
                        <form onSubmit={handleSendReport} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Masalah</label>
                                <input 
                                    type="text" 
                                    value={reportIssue}
                                    onChange={(e) => setReportIssue(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-200 transition-colors"
                                    placeholder="Judul singkat masalah..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Kategori</label>
                                <div className="relative">
                                    <select
                                        value={reportCategory}
                                        onChange={(e) => setReportCategory(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-200 appearance-none transition-colors"
                                    >
                                        <option value="General">Umum</option>
                                        <option value="Login">Masalah Login</option>
                                        <option value="Bug">Bug / Error</option>
                                        <option value="Feature">Saran Fitur</option>
                                    </select>
                                    <ChevronRight className="absolute right-4 top-3 w-4 h-4 text-slate-500 rotate-90 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Deskripsi</label>
                                <textarea 
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 h-28 text-slate-200 resize-none transition-colors"
                                    placeholder="Jelaskan detail masalah..."
                                    required
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmittingReport}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                            >
                                {isSubmittingReport ? 'Mengirim...' : 'Kirim Laporan'}
                            </button>
                        </form>
                    </div>
                    
                    {/* History */}
                    <div className="space-y-4 border-l border-slate-800 pl-8 h-[400px] overflow-y-auto custom-scrollbar">
                        <h4 className="font-semibold text-blue-400 text-sm uppercase tracking-wider sticky top-0 bg-slate-900 pb-2 z-10">Riwayat Laporan</h4>
                        {myReports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center opacity-60">
                                <FileText className="w-10 h-10 text-slate-600 mb-2" />
                                <p className="text-slate-500 text-sm">Belum ada laporan</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myReports.map((rep) => (
                                    <div key={rep.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <span className="text-slate-200 font-medium text-sm line-clamp-1">{rep.issue}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex-shrink-0 ${
                                                rep.status === 'Selesai' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {rep.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">{rep.description}</p>
                                        
                                        {/* Admin Reply */}
                                        {rep.reply && (
                                            <div className="mt-3 bg-blue-900/10 p-3 rounded-lg border border-blue-500/10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                    <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">Respon Admin</p>
                                                </div>
                                                <p className="text-xs text-slate-300 pl-3.5 border-l-2 border-blue-500/20">{rep.reply}</p>
                                            </div>
                                        )}
                                        <p className="text-[10px] text-slate-600 mt-2 text-right">{rep.date}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}