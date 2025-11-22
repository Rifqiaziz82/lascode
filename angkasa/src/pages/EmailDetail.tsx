import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import DashboardHeader from "../components/DashboardHeader";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  FileText,
  Trophy,
  Medal,
  Star,
} from "lucide-react";


interface EmailItem {
  id: string;
  subject: string;
  sender: string;
  content: string;
  time: string;
  isVerified: boolean;
  attachment: string;
  badge: string;
  icon: "trophy" | "medal" | "star";
}

interface AcceptedCert {
  id: string;
  title: string;
  issuer: string;
  date: string;
  badge: string;
  icon: "trophy" | "medal" | "star";
  file: string;
}

const mockEmails: EmailItem[] = [
  {
    id: "1",
    subject: "Verifikasi Sertifikat - Juara 1 Lomba Desain Grafis",
    sender: "Panitia Lomba Desain 2024",
    content: `Kepada Yth. Peserta Lomba Desain Grafis Nasional 2024,

Selamat! Kami dengan bangga mengumumkan bahwa sertifikat Anda sebagai **Juara 1 Lomba Desain Grafis Nasional 2024** telah berhasil diverifikasi oleh tim kami.`,
    time: "10:30",
    isVerified: true,
    attachment: "Sertifikat_Juara1_DesainGrafis_2024.pdf",
    badge: "Juara 1",
    icon: "trophy",
  },
];

const mockAcceptedCerts: AcceptedCert[] = [
  {
    id: "cert-001",
    title: "Sertifikat Juara 1 - Lomba Robotik ITB 2024",
    issuer: "Institut Teknologi Bandung",
    date: "15 Oktober 2024",
    badge: "Juara 1",
    icon: "trophy",
    file: "Sertifikat_Juara1_Robotik_ITB_2024.pdf",
  },
];

export default function EmailDetail() {
  useAuth();
  const navigate = useNavigate();
  const { id } = useParams();


  const emailItem = mockEmails.find(e => e.id === id);
  const acceptedItem = mockAcceptedCerts.find(c => c.id === id);

  if (!emailItem && !acceptedItem) {
    return (
      <div className="min-h-screen pt-20 pb-20">
        <DashboardHeader />
        <div className="container mx-auto px-4 sm:px-6 pt-12 text-center">
          <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 p-12 max-w-md mx-auto">
            <div className="text-slate-500 mb-4">📧</div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">Data Tidak Ditemukan</h2>
            <button
              onClick={() => navigate("/email")}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors mt-4"
            >
              Kembali ke Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (acceptedItem) {
    // ✅ Ini pasti AcceptedCert → aman akses .title, .issuer, dll
    const item = acceptedItem;

    const renderIcon = () => {
      if (item.icon === "trophy") return <Trophy className="w-3 h-3" />;
      if (item.icon === "medal") return <Medal className="w-3 h-3" />;
      return <Star className="w-3 h-3" />;
    };

    const handleUpload = () => {
      alert(`✅ "${item.title}" berhasil diunggah ke portofolio!`);
      navigate("/email");
    };

    return (
      <div className="min-h-screen pb-20">
        <DashboardHeader />
        <main className="container mx-auto px-4 sm:px-6 pt-24 max-w-4xl">
          <button
            onClick={() => navigate("/email")}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Email
          </button>

          <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
            <div className="p-6 border-b border-slate-600/30 bg-slate-900/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Sertifikat Diterima
                    </span>
                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs font-medium rounded-full flex items-center gap-1">
                      {renderIcon()} {item.badge}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-100 mb-2">{item.title}</h1>
                  <p className="text-slate-400">Diterbitkan oleh: {item.issuer} • {item.date}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-slate-300">
                <p className="mb-4">
                  Sertifikat ini telah diverifikasi oleh sistem Angkasa dan siap untuk diunggah ke portofolio profil Anda.
                </p>
                <p>
                  Anda dapat menampilkannya di halaman profil agar dapat dilihat oleh perekrut, institusi, atau komunitas.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-200">{item.file}</h3>
                    <p className="text-sm text-slate-500">PDF • 2.4 MB</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleUpload}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
                >
                  <Upload className="w-4 h-4" /> Unggah ke Portofolio
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const item = emailItem!;

  const renderIcon = () => {
    if (item.icon === "trophy") return <Trophy className="w-3 h-3" />;
    if (item.icon === "medal") return <Medal className="w-3 h-3" />;
    return <Star className="w-3 h-3" />;
  };

  return (
    <div className="min-h-screen pb-20">
      <DashboardHeader />
      <main className="container mx-auto px-4 sm:px-6 pt-24 max-w-4xl">
        <button
          onClick={() => navigate("/email")}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Email
        </button>

        <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
          <div className="p-6 border-b border-slate-600/30 bg-slate-900/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Terverifikasi
                  </span>
                  <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs font-medium rounded-full flex items-center gap-1">
                    {renderIcon()} {item.badge}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-100 mb-2">{item.subject}</h1>
                <p className="text-slate-400">Dari: {item.sender} • {item.time}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-slate-300 whitespace-pre-line leading-relaxed">
              {item.content}
            </div>

            <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-200">{item.attachment}</h3>
                  <p className="text-sm text-slate-500">PDF • 2.4 MB</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-200">Status Verifikasi: Terverifikasi</p>
                <p className="text-sm text-slate-400">
                  Diverifikasi pada 18 November 2025, {item.time} WIB
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => alert("✅ Sertifikat diunduh!")}
                className="flex-1 px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Unduh Sertifikat
              </button>
              <button
                onClick={() => {
                  alert("✅ Ditambahkan ke portofolio!");
                  navigate("/email");
                }}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Tambah ke Portofolio
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}