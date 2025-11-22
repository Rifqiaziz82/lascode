// src/pages/Notifikasi.tsx
import { useAuth } from "../components/AuthProvider";
import DashboardHeader from "../components/DashboardHeader";
import {
  Bell,
  TrendingUp,
  Sparkles,
  CheckCircle as CheckCircleIcon,
} from "lucide-react";

interface Notification {
  id: number;
  type: "lomba" | "beasiswa";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "lomba",
    title: "Lomba Desain Grafis Nasional 2024",
    description: "Pendaftaran telah dibuka! Deadline: 30 November 2024. Total hadiah 50 juta rupiah.",
    timestamp: "1 jam yang lalu",
    isRead: false,
  },
  {
    id: 2,
    type: "beasiswa",
    title: "Beasiswa S2 Luar Negeri",
    description: "Program beasiswa penuh ke Jepang untuk studi S2. Dibuka hingga 15 Desember 2024.",
    timestamp: "3 jam yang lalu",
    isRead: false,
  },
  {
    id: 3,
    type: "lomba",
    title: "Update: Hackathon Nasional 2024",
    description: "Timeline diperpanjang! Waktu submission diperpanjang hingga 5 Desember 2024.",
    timestamp: "5 jam yang lalu",
    isRead: true,
  },
  {
    id: 4,
    type: "beasiswa",
    title: "Beasiswa Unggulan Kemendikbud",
    description: "Pendaftaran batch 2 telah dibuka. Daftar sekarang untuk kesempatan mendapat beasiswa dalam negeri.",
    timestamp: "1 hari yang lalu",
    isRead: true,
  },
  {
    id: 5,
    type: "lomba",
    title: "Lomba Karya Tulis Ilmiah",
    description: "Kompetisi KTI tingkat universitas. Tema: Inovasi Teknologi untuk Indonesia Maju.",
    timestamp: "2 hari yang lalu",
    isRead: true,
  },
];

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "lomba":
      return <TrendingUp className="w-5 h-5 text-slate-300" />;
    case "beasiswa":
      return <Sparkles className="w-5 h-5 text-slate-300" />;
  }
};

const getTypeBadge = (type: Notification["type"]) => {
  return type === "lomba" ? (
    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full flex items-center gap-1">
      🏆 Lomba
    </span>
  ) : (
    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full flex items-center gap-1">
      🎓 Beasiswa
    </span>
  );
};

export default function Notifications() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 pt-24 max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-xl border-2 border-slate-600/30 px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-300" />
              <h1 className="text-2xl font-bold text-slate-200">Notifikasi</h1>
            </div>
          </div>
        </div>

        {/* Daftar Notifikasi */}
        <div className="space-y-3">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-slate-800/30 backdrop-blur-md rounded-xl border ${
                !notification.isRead
                  ? "border-green-500/50 bg-slate-800/50"
                  : "border-slate-600/30"
              } hover:border-slate-500/40 transition-colors cursor-pointer overflow-hidden`}
            >
              <div className="p-4 flex gap-4">
                <div
                  className={`p-2.5 rounded-lg flex-shrink-0 ${
                    !notification.isRead ? "bg-green-500/10" : "bg-slate-700/40"
                  }`}
                >
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`font-semibold ${
                          !notification.isRead ? "text-slate-100" : "text-slate-300"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {getTypeBadge(notification.type)}
                    </div>
                    <span
                      className={`text-xs whitespace-nowrap ${
                        !notification.isRead
                          ? "text-green-400 font-medium flex items-center gap-1"
                          : "text-slate-500"
                      }`}
                    >
                      {!notification.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      )}
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{notification.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}