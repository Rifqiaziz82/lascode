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
  Lock,
  CheckCircle,
  Sparkles,
  LogOut,
  X,
  ChevronRight,
  Instagram,
  Youtube,
  Twitch,
} from "lucide-react";
import { doc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

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
  }
];

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("Music Producer");
  const [experience, setExperience] = useState("Intermediate");
  const [favArtists, setFavArtists] = useState("Ninho, Travis Scott, Metro Boomin");
  const [favGenre, setFavGenre] = useState("Trap");
  const [software, setSoftware] = useState("Ableton");
  const [city, setCity] = useState("California, USA");
  const [availability, setAvailability] = useState("Available for Collaboration");
  const [tags, setTags] = useState("#Drill #Melancholic #Rap-US");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievements] = useState<Achievement[]>(mockAchievements);

  // Form tambah sertifikat
  const [newCertTitle, setNewCertTitle] = useState("");
  const [newCertCompetition, setNewCertCompetition] = useState("");
  const [newCertImageUrl, setNewCertImageUrl] = useState("");
  const [isAddingCert, setIsAddingCert] = useState(false);

  // State for Modals
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  /* Help Modal State */
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [reportIssue, setReportIssue] = useState('');
  const [reportCategory, setReportCategory] = useState('General');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [myReports, setMyReports] = useState<any[]>([]);

  useEffect(() => {
        if (showHelpModal && user) {
             // Fetch my reports
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
        setRole(user.role || "");
        setExperience(user.experience_level || "Intermediate");
        setFavArtists((user.favorite_artists || []).join(", "));
        setFavGenre(user.favorite_genre || "Trap");
        setSoftware(user.software_used || "Ableton");
        setCity(user.city_region || "California, USA");
        setAvailability(user.availability || "Available for Collaboration");
        setTags((user.tags || []).join(" "));
        
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        email,
        bio,
        role,
        experience_level: experience,
        favorite_artists: favArtists.split(",").map(s => s.trim()).filter(Boolean),
        favorite_genre: favGenre,
        software_used: software,
        city_region: city,
        availability,
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

  const addCertificate = async () => {
    if (!user) return;
    setIsAddingCert(true);
    try {
      await addDoc(collection(db, 'certificates'), {
        user_id: user.id,
        username: user.name || "User",
        title: newCertTitle.trim(),
        competition_name: newCertCompetition.trim(),
        verified: false,
        image_url: newCertImageUrl.trim() || "https://via.placeholder.com/600x400?text=No+Image",
        public: true,
        created_at: new Date().toISOString()
      });

      // Reset form
      setNewCertTitle("");
      setNewCertCompetition("");
      setNewCertImageUrl("");

      // Reload
      const q = query(collection(db, 'certificates'), where('user_id', '==', user.id), where('public', '==', true));
      const snapshot = await getDocs(q);
      const certs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Certificate[];
      setCertificates(certs);

      alert("✅ Sertifikat berhasil ditambahkan!");
    } catch (err) {
      console.error("Gagal tambah sertifikat:", err);
      alert("❌ Gagal menambahkan sertifikat.");
    } finally {
      setIsAddingCert(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Trophy": return <Trophy className="w-6 h-6" />;
      case "Award": return <Award className="w-6 h-6" />;
      case "Star": return <Star className="w-6 h-6" />;
      case "Medal": return <Medal className="w-6 h-6" />;
      case "FileText": return <FileText className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };


    const handleSendReport = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Debugging: Check what user object looks like
        console.log("Current User Object:", user);
        
        // Fallback: Get UID directly from Firebase Auth if Context is missing it
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
            
            // Add to local state immediately for UX
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen text-slate-200 pb-20">
      <DashboardHeader />

      <div className="container mt-14 mx-auto px-4 sm:px-6 pt-8 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-2">Profile Saya</h1>
          <p className="text-slate-500 text-sm">Edit dan kelola informasi profil kamu.</p>
        </div>

        {/* Main Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column: Avatar & Name */}
          <div className=" rounded-xl p-6 border bg-slate-800/30 border border-slate-600/30 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-500 mb-4 shadow-inner">
                <span className="text-6xl font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-4xl font-bold mt-2">{name}</h2>
              <button className="mt-4 p-2 bg-slate-600 hover:bg-slate-500 rounded-full text-white">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Column: Editable Bio & Details */}
          <div className="lg:col-span-2  rounded-xl p-6 border bg-slate-800/30 border border-slate-600/30 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bio & Detail Profil</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kolom Kiri */}
              <div>
                <div className="mb-3">
                  <label className="text-xs text-slate-400 block mb-1">Nama Lengkap</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-slate-400 block mb-1">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-slate-400 block mb-1">My Role</label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-slate-400 block mb-1">My 3 Favorite Artists</label>
                  <input
                    value={favArtists}
                    onChange={(e) => setFavArtists(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              {/* Kolom Kanan */}
              <div>
                <div className="mb-3">
                  <label className="text-xs text-slate-400 block mb-1">Bio</label>
                  <input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-slate-400 block mb-1">My Experience Level</label>
                  <input
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-slate-400 block mb-1">My Favorite Music Genre</label>
                  <input
                    value={favGenre}
                    onChange={(e) => setFavGenre(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-slate-400 block mb-1">The Software I Use</label>
                  <input
                    value={software}
                    onChange={(e) => setSoftware(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Tags & Lokasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">My City or Region</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tags (pisahkan dengan spasi)</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isSaving
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className=" rounded-xl p-6 border bg-slate-800/30 border border-slate-600/30 mb-8 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Social Media (opsional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Instagram (username)"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none"
            />
            <input
              placeholder="YouTube (channel)"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none"
            />
            <input
              placeholder="TikTok (username)"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* My Productions */}
        <div className="rounded-xl p-6 border bg-slate-800/30 border border-slate-600/30 mb-8 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Portofolio Saya</h3>
            <span className="text-xs text-slate-400">Klik item untuk lihat</span>
          </div>
          {certificates.length === 0 ? (
            <p className="text-slate-500 text-center py-6">Belum ada sertifikat/produksi</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCertificate(cert)}
                  className="aspect-square rounded-lg bg-slate-700 border border-slate-600 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={cert.image_url || `https://via.placeholder.com/300?text=${cert.title}`}
                    alt={cert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="p-2 text-center">
                    <p className="text-xs text-white font-medium line-clamp-1">{cert.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tambah Sertifikat */}
        <div className=" rounded-xl p-6 border bg-slate-800/30 border border-slate-600/30 mb-8 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Tambah Portofolio</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Judul Sertifikat"
              value={newCertTitle}
              onChange={(e) => setNewCertTitle(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="Nama Kompetisi"
              value={newCertCompetition}
              onChange={(e) => setNewCertCompetition(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="URL Gambar (opsional)"
              value={newCertImageUrl}
              onChange={(e) => setNewCertImageUrl(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none"
            />
            <button
              onClick={addCertificate}
              disabled={isAddingCert}
              className={`w-full py-2 font-medium rounded-lg ${
                isAddingCert ? "bg-slate-700 text-slate-400" : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isAddingCert ? "Menyimpan..." : "Tambah Sertifikat"}
            </button>
          </div>
        </div>

        {/* Pencapaian */}
        <div className=" rounded-xl p-6 border bg-slate-800/30 border border-slate-600/30 mb-8 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Pencapaian</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.slice(0, 4).map((ach) => {
              const Icon = getIcon(ach.icon);
              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-lg border flex flex-col items-center gap-2 ${
                    ach.is_unlocked
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-slate-700/20 border-slate-600/40 opacity-70"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-600/30">
                    {Icon}
                  </div>
                  <span className="text-xs font-medium text-center text-slate-200">
                    {ach.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Menu Bawah */}
        <div className=" rounded-xl p-4 border bg-slate-800/30 border border-slate-600/30 shadow-md">
          <p className="text-sm font-semibold text-slate-300 mb-3">Akun</p>
          <div className="space-y-2">
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded">
              <HelpCircle className="w-4 h-4" /> FAQs
            </button>
                  <button 
                    onClick={() => setShowHelpModal(true)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded"
                  >
                    <FileText className="w-4 h-4" /> Bantuan
                  </button>
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded">
              <Settings className="w-4 h-4" /> Pengaturan Lanjutan
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCertificate(null)}>
          <div className="relative bg-slate-800 rounded-xl max-w-3xl w-full p-2" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 p-2 bg-slate-700/50 hover:bg-slate-600 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedCertificate.image_url || "https://via.placeholder.com/600x400?text=No+Image"}
              alt={selectedCertificate.title}
              className="w-full h-auto rounded-lg"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-bold text-white">{selectedCertificate.title}</h3>
              <p className="text-slate-400">{selectedCertificate.competition_name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Achievements & All Certs Modals can be added if needed */}

             {/* Report Modal */}
             {showHelpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                            <h3 className="text-xl font-bold text-white">Bantuan & Laporan</h3>
                            <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 grid gap-6 md:grid-cols-2">
                            {/* New Report Form */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-blue-400">Buat Laporan Baru</h4>
                                <form onSubmit={handleSendReport} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Masalah</label>
                                        <input 
                                            type="text" 
                                            value={reportIssue}
                                            onChange={(e) => setReportIssue(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                            placeholder="Judul singkat masalah..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Kategori</label>
                                        <select
                                            value={reportCategory}
                                            onChange={(e) => setReportCategory(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="General">Umum</option>
                                            <option value="Login">Masalah Login</option>
                                            <option value="Bug">Bug / Error</option>
                                            <option value="Feature">Saran Fitur</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Deskripsi</label>
                                        <textarea 
                                            value={reportDescription}
                                            onChange={(e) => setReportDescription(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-24"
                                            placeholder="Jelaskan detail masalah..."
                                            required
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmittingReport}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium transition-colors"
                                    >
                                        {isSubmittingReport ? 'Mengirim...' : 'Kirim Laporan'}
                                    </button>
                                </form>
                            </div>
                            
                            {/* History */}
                            <div className="space-y-4 border-l border-slate-700 pl-6 h-[400px] overflow-y-auto">
                                <h4 className="font-semibold text-blue-400">Riwayat Laporan</h4>
                                {myReports.length === 0 ? (
                                    <p className="text-slate-500 text-sm italic">Belum ada laporan yang dikirim.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {myReports.map((rep) => (
                                            <div key={rep.id} className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-white font-medium text-sm">{rep.issue}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${rep.status === 'Selesai' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {rep.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 mb-2 truncate">{rep.description}</p>
                                                
                                                {/* Admin Reply */}
                                                {rep.reply && (
                                                    <div className="mt-2 bg-blue-900/20 p-2 rounded border border-blue-500/20">
                                                        <p className="text-xs text-blue-300 font-semibold mb-1">Balasan Admin:</p>
                                                        <p className="text-xs text-slate-300">{rep.reply}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
}