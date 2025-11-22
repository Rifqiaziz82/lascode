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
  Unlock,
  CheckCircle,
  Sparkles,
} from "lucide-react";


// Mock data (sesuai dengan struktur di kode Anda)
interface Certificate {
  id: string;
  title: string;
  competition_name: string;
  verified: boolean;
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

const mockCertificates: Certificate[] = [
  {
    id: "1",
    title: "Sertifikat Juara 1 - Lomba Robotik ITB 2024",
    competition_name: "Lomba Robotik ITB 2024",
    verified: true,
  },
  {
    id: "2",
    title: "Sertifikat Peserta - Webinar AI Nasional",
    competition_name: "Webinar AI Nasional",
    verified: true,
  },
];

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
    name: "Pemenang Pertama",
    description: "Menangkan 1 lomba tingkat nasional",
    icon: "Trophy",
    requirement_count: 1,
    requirement_type: "lomba",
    is_unlocked: true,
  },
  {
    id: "ach-003",
    name: "Pencari Beasiswa",
    description: "Terima 3 beasiswa",
    icon: "Award",
    requirement_count: 3,
    requirement_type: "beasiswa",
    is_unlocked: false,
  },
  {
    id: "ach-004",
    name: "Kontributor Aktif",
    description: "Buat 5 posting di forum",
    icon: "Medal",
    requirement_count: 5,
    requirement_type: "forum",
    is_unlocked: false,
  },
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [certificates] = useState<Certificate[]>(mockCertificates);
  const [achievements] = useState<Achievement[]>(mockAchievements);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setName(user.name || "");
    setEmail(user.email || "");
    setBio(user.bio || "");
  }, [user, navigate]);

  const handleSave = () => {
    updateProfile({ name, email, bio });
    toast.success("✅ Profil berhasil diperbarui!");
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Trophy": return <Trophy className="w-6 h-6" />;
      case "Award": return <Award className="w-6 h-6" />;
      case "Star": return <Star className="w-6 h-6" />;
      case "Medal": return <Medal className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 pt-24 max-w-4xl">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="rounded-xl border-2 border-slate-600/30 px-6 py-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-300" />
              <h1 className="text-2xl font-bold text-slate-200">Profil</h1>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-slate-700/40 flex items-center justify-center border-4 border-slate-600/50">
                    <span className="text-4xl font-bold text-slate-200">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 bg-slate-600 hover:bg-slate-500 rounded-full text-white">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <div className="w-full max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bio</label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Ceritakan tentang dirimu..."
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    className="w-full py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-slate-300" />
                <h2 className="text-lg font-semibold text-slate-200">Portofolio</h2>
              </div>
              {certificates.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Belum ada sertifikat terverifikasi</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="aspect-square rounded-lg bg-slate-700/30 border border-slate-600/40 p-3 flex flex-col items-center justify-center text-center"
                    >
                      <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                      <p className="text-xs text-slate-200 font-medium line-clamp-2">{cert.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-slate-300" />
                <h2 className="text-lg font-semibold text-slate-200">Pencapaian</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((ach) => {
                  const Icon = getIcon(ach.icon);
                  return (
                    <div
                      key={ach.id}
                      className={`p-4 rounded-lg border flex flex-col items-center gap-2 ${
                        ach.is_unlocked
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-slate-700/20 border-slate-600/40 opacity-70"
                      }`}
                    >
                      <div className="relative">
                        {!ach.is_unlocked && (
                          <Lock className="absolute inset-0 m-auto w-5 h-5 text-slate-500 z-10" />
                        )}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          ach.is_unlocked ? "bg-green-500/20" : "bg-slate-600/30"
                        }`}>
                          {Icon}
                        </div>
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        ach.is_unlocked ? "text-slate-200" : "text-slate-500"
                      }`}>
                        {ach.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">FAQs</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-lg transition-colors">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Bantuan</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Pengaturan</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}