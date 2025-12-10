// src/components/NotificationSidebar.tsx
import { X, Bell, Trophy, Medal, User, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { auth } from "../firebase";
import { rtdb } from "../firebase";

// Tipe data dari Firebase
interface FirebaseNotification {
  id: string;
  title: string;
  message: string;
  type: "lomba" | "beasiswa";
  badge: string | null;
  timestamp: string;
  sentBy: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  };
}

// Tipe untuk UI
interface Notification extends FirebaseNotification {
  isRead: boolean;
  formattedTime: string;
}

// Ambil inisial dari nama/email
const getInitials = (name: string | null | undefined, email?: string | null) => {
  const source = name || email?.split("@")[0] || "Admin";
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Format waktu relatif
const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Modal Detail Notifikasi
const NotificationDetailModal: React.FC<{
  notification: Notification;
  onClose: () => void;
  onDelete: () => void;
}> = ({ notification, onClose, onDelete }) => {
  const { sentBy } = notification;
  const initials = getInitials(sentBy.displayName, sentBy.email);
  const adminName = sentBy.displayName || sentBy.email?.split("@")[0] || "Admin";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Detail Notifikasi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{adminName}</p>
              <p className="text-xs text-gray-400">Mengirim notifikasi</p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-blue-400">{notification.title}</h3>
          <p className="text-gray-300 whitespace-pre-line">{notification.message}</p>

          {notification.badge && (
            <div className="mt-3">
              <span className="px-3 py-1 bg-blue-700/30 text-blue-300 text-sm font-medium rounded-full">
                {notification.badge}
              </span>
            </div>
          )}

          <div className="flex justify-between text-xs text-gray-500 mt-4">
            <span>{notification.type === "lomba" ? "🏆 Lomba" : "🎓 Beasiswa"}</span>
            <span>{notification.formattedTime}</span>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 flex gap-2">
          <button
            onClick={onDelete}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition flex items-center justify-center gap-1"
          >
            <Trash2 size={16} />
            Hapus
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const currentUser = auth.currentUser;
  const currentUserUid = currentUser?.uid || null;

  useEffect(() => {
    if (!isOpen || !currentUserUid) {
      setLoading(false);
      return;
    }

    const globalNotifsRef = ref(rtdb, "notifications");
    const userNotifsRef = ref(rtdb, `user_notifications/${currentUserUid}`);

    const unsubscribeGlobal = onValue(globalNotifsRef, (snapshot) => {
      const globalNotifs = snapshot.val() || {};

      const unsubscribeUser = onValue(userNotifsRef, (userSnapshot) => {
        const userNotifs = userSnapshot.val() || {};

        const mergedNotifs: Notification[] = Object.keys(globalNotifs).map((id) => {
          const global = globalNotifs[id];
          const user = userNotifs[id] || { isRead: false };
          return {
            ...global,
            id,
            isRead: user.isRead,
            formattedTime: formatRelativeTime(global.timestamp),
          };
        });

        mergedNotifs.sort((a, b) => (a.isRead !== b.isRead ? (a.isRead ? 1 : -1) : 0));
        setNotifications(mergedNotifs);
        setLoading(false);
      });

      return () => unsubscribeUser();
    });

    return () => unsubscribeGlobal();
  }, [isOpen, currentUserUid]);

  const markAsRead = (id: string) => {
    if (!currentUserUid) return;
    const userNotifRef = ref(rtdb, `user_notifications/${currentUserUid}/${id}`);
    set(userNotifRef, { isRead: true });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    if (!currentUserUid) return;
    notifications.forEach((n) => {
      const userNotifRef = ref(rtdb, `user_notifications/${currentUserUid}/${n.id}`);
      set(userNotifRef, { isRead: true });
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    if (!currentUserUid) return;
    const userNotifRef = ref(rtdb, `user_notifications/${currentUserUid}/${id}`);
    remove(userNotifRef);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteAllNotifications = () => {
    if (!currentUserUid) return;
    if (!window.confirm("Hapus semua notifikasi? Tindakan ini tidak bisa dikembalikan.")) return;
    notifications.forEach((n) => {
      const userNotifRef = ref(rtdb, `user_notifications/${currentUserUid}/${n.id}`);
      remove(userNotifRef);
    });
    setNotifications([]);
  };

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    setSelectedNotification(notif);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />}

      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-900/95 border-l border-slate-700/50 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <Bell className="w-5 h-5 text-slate-200" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Notifikasi</h2>
                {!loading && (
                  <p className="text-xs text-slate-500">
                    {notifications.filter((n) => !n.isRead).length} belum dibaca
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-400">Memuat notifikasi...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Tidak ada notifikasi.</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    !notification.isRead
                      ? "bg-slate-800/80 border-slate-600/50 hover:bg-slate-800"
                      : "bg-slate-800/20 border-transparent hover:bg-slate-800/40"
                  }`}
                >
                  {!notification.isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                  )}

                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(notification.sentBy.displayName, notification.sentBy.email)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            notification.type === "lomba"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {notification.type === "lomba" ? "Lomba" : "Beasiswa"}
                        </span>
                        {notification.badge && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-700/20 text-blue-300">
                            {notification.badge}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 ml-auto">
                          {notification.formattedTime}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-semibold leading-snug ${
                          !notification.isRead ? "text-slate-100" : "text-slate-300"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Tandai Semua & Hapus Semua */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex gap-2">
            <button
              onClick={markAllAsRead}
              className="flex-1 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Tandai Sudah Dibaca
            </button>
            <button
              onClick={deleteAllNotifications}
              className="flex-1 py-2 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 size={14} />
              Hapus Semua
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onDelete={() => {
            deleteNotification(selectedNotification.id);
            setSelectedNotification(null);
          }}
        />
      )}
    </>
  );
}