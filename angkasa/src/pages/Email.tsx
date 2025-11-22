
import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import {
  Mail,
  Inbox,
  CheckCircle as CheckCircleIcon,
  Paperclip,
  Search as SearchIcon,
} from "lucide-react";

// Email masuk
const mockEmails = [
  {
    id: "1",
    subject: "Verifikasi Sertifikat - Juara 1 Lomba Desain Grafis",
    senderName: "Panitia Lomba Desain",
    preview: "Selamat! Sertifikat Anda sebagai Juara 1 telah terverifikasi...",
    time: "10:30",
    read: false,
    starred: true,
    attachments: 1,
  },
  {
    id: "2",
    subject: "Sertifikat Peserta Hackathon Nasional 2024",
    senderName: "Komite Hackathon",
    preview: "Sertifikat partisipasi Anda telah diverifikasi dan siap diunduh...",
    time: "Kemarin",
    read: true,
    starred: false,
    attachments: 1,
  },
  {
    id: "3",
    subject: "Verifikasi Sertifikat Juara 2 - Lomba KTI 2024",
    senderName: "Panitia KTI",
    preview: "Selamat! Sertifikat Juara 2 Anda telah terverifikasi...",
    time: "2 hari lalu",
    read: true,
    starred: false,
    attachments: 1,
  },
  {
    id: "4",
    subject: "Sertifikat Finalis - Kompetisi Programming 2024",
    senderName: "Kompetisi Programming",
    preview: "Sertifikat Anda sebagai Finalis telah berhasil diverifikasi...",
    time: "3 hari lalu",
    read: false,
    starred: false,
    attachments: 1,
  },
];

// ✅ Sertifikat yang sudah diterima (diverifikasi)
const mockAcceptedCerts = [
  {
    id: "cert-001",
    title: "Sertifikat Juara 1 - Lomba Robotik ITB 2024",
    issuer: "Institut Teknologi Bandung",
    date: "15 Oktober 2024",
    badge: "Juara 1",
    icon: "trophy", 
    file: "Sertifikat_Juara1_Robotik_ITB_2024.pdf",
    type: "accepted" as const,
  },
  {
    id: "cert-002",
    title: "Sertifikat Peserta - Webinar AI Nasional",
    issuer: "Kemenkominfo",
    date: "5 November 2024",
    badge: "Peserta",
    icon: "medal",
    file: "Sertifikat_Peserta_AI_Webinar.pdf",
    type: "accepted",
  },
];

export default function Email() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inbox" | "starred" | "accepted">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [acceptedCertificates] = useState(mockAcceptedCerts);


  const filteredEmails = mockEmails.filter(email => {
    const matchesTab = 
      (activeTab === "inbox") ||
      (activeTab === "starred" && email.starred);
    
    const matchesSearch = 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Reset pencarian saat ganti tab
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className=" rounded-xl border border-4 border-slate-600/30 px-8 py-5 shadow-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mail className="w-6 h-6 text-slate-300" />
                  <h1 className="text-2xl font-bold text-slate-200">Email</h1>
                </div>
                <p className="text-slate-400">Jangan lupa untuk mengecek pesan emailmu!</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
                <div className="p-4 border-b border-slate-600/30">
                  <h2 className="font-semibold text-slate-200">Kategori</h2>
                </div>
                <nav className="p-2">
                  {[
                    { id: "inbox", label: "Semua Verifikasi", icon: Inbox, count: mockEmails.length },
                    { id: "starred", label: "Ditandai", icon: Star, count: mockEmails.filter(e => e.starred).length },
                    { id: "accepted", label: "Sertifikat Diterima", icon: CheckCircleIcon, count: acceptedCertificates.length },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? "bg-slate-700/50 text-white"
                            : "text-slate-300 hover:bg-slate-700/30"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.count > 0 && (
                          <span className="ml-auto bg-slate-600 text-slate-200 text-xs px-1.5 py-0.5 rounded-full">
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
            <div className="lg:col-span-3">
              {/* Search Bar (hanya di inbox & starred) */}
              {activeTab !== "accepted" && (
                <div className="mb-4 relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari sertifikat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              )}

              {/* Konten Berdasarkan Tab */}
              {activeTab === "accepted" ? (
                // ✅ Tampilan Sertifikat yang Diterima
                <div className="space-y-4">
                  {acceptedCertificates.length === 0 ? (
                    <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 p-12 text-center">
                      <CheckCircleIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-200 mb-2">Belum ada sertifikat yang diterima</h3>
                      <p className="text-slate-400">
                        Sertifikat yang telah diverifikasi akan muncul di sini setelah Anda mengonfirmasi dari email.
                      </p>
                    </div>
                  ) : (
                    acceptedCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        onClick={() => navigate(`/email/accepted/${cert.id}`)}
                        className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden cursor-pointer hover:border-green-500/50 transition-colors"
                      >
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-green-500/10">
                              {cert.icon === "trophy" ? (
                                <Trophy className="w-6 h-6 text-green-400" />
                              ) : cert.icon === "medal" ? (
                                <Medal className="w-6 h-6 text-green-400" />
                              ) : (
                                <Star className="w-6 h-6 text-green-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-medium rounded">
                                  <CheckCircleIcon className="w-3 h-3 inline mr-1" />
                                  Diterima
                                </span>
                                <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs font-medium rounded flex items-center gap-1">
                                  {cert.icon === "trophy" ? (
                                    <Trophy className="w-3 h-3" />
                                  ) : cert.icon === "medal" ? (
                                    <Medal className="w-3 h-3" />
                                  ) : (
                                    <Star className="w-3 h-3" />
                                  )}
                                  {cert.badge}
                                </span>
                              </div>
                              <h3 className="font-bold text-slate-100">{cert.title}</h3>
                              <p className="text-slate-400 text-sm">{cert.issuer} • {cert.date}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Daftar Email
                <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
                  {filteredEmails.length === 0 ? (
                    <div className="p-12 text-center">
                      <Mail className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">Tidak ada sertifikat yang sesuai.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700/50">
                      {filteredEmails.map((email) => (
                        <div
                          key={email.id}
                          onClick={() => navigate(`/email/${email.id}`)}
                          className={`p-4 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                            !email.read ? "bg-slate-800/50 border-l-4 border-green-500" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-200">{email.senderName}</span>
                                {email.starred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                                {email.attachments > 0 && <Paperclip className="w-3.5 h-3.5 text-slate-500" />}
                              </div>
                              <h3 className="font-semibold text-slate-100 truncate">{email.subject}</h3>
                              <p className="text-slate-400 text-sm line-clamp-1 mt-1">{email.preview}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs ${
                                email.read ? "text-slate-500" : "text-green-400 font-medium"
                              }`}>
                                {email.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ✅ Import ikon yang dibutuhkan di file ini
function Trophy({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function Medal({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}