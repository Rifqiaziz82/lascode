import React, { useState, useEffect } from 'react';
import {
  Bell,
  BookOpen,
  Clock,
  Send,
  User,
  Edit2,
  Trash2,
  Trophy,
  Medal,
  Tag,
} from 'lucide-react';
import { InputField, Modal, GlassCard } from './AdminCommon';
import {
  ref,
  push,
  set,
  onValue,
  update,
  remove,
} from 'firebase/database';
import { auth, rtdb } from '../../firebase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'lomba' | 'beasiswa';
  badge: string | null;
  timestamp: string;
  sentBy: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  };
}

const NotificationForm: React.FC<{
  onClose: () => void;
  notificationToEdit?: Notification | null;
  onSubmit: (data: Pick<Notification, 'title' | 'message' | 'type' | 'badge'>) => void;
  isSubmitting: boolean;
}> = ({ onClose, notificationToEdit, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState(notificationToEdit?.title || '');
  const [message, setMessage] = useState(notificationToEdit?.message || '');
  const [type, setType] = useState<Notification['type']>(notificationToEdit?.type || 'lomba');
  const [badge, setBadge] = useState(notificationToEdit?.badge || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle || !trimmedMessage) {
      setError('Judul dan pesan tidak boleh kosong.');
      return;
    }

    onSubmit({
      title: trimmedTitle,
      message: trimmedMessage,
      type,
      badge: badge.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField
        id="notifTitle"
        label="Judul Pesan"
        type="text"
        value={title}
        onChange={setTitle}
        Icon={Bell}
      />
      <InputField
        id="notifMessage"
        label="Isi Pesan"
        type="textarea"
        value={message}
        onChange={setMessage}
        Icon={BookOpen}
      />

      <div className="space-y-2">
        <label htmlFor="notifType" className="text-xs md:text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Trophy size={16} className="text-blue-400" />
          Tipe Notifikasi <span className="text-red-400">*</span>
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setType('lomba')}
            className={`flex-1 py-3 px-3 rounded-xl border text-sm font-medium transition-all duration-200 ${type === 'lomba'
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
          >
            <Trophy size={16} className="inline mr-2" /> Lomba
          </button>
          <button
            type="button"
            onClick={() => setType('beasiswa')}
            className={`flex-1 py-3 px-3 rounded-xl border text-sm font-medium transition-all duration-200 ${type === 'beasiswa'
              ? 'bg-purple-600/20 border-purple-500 text-purple-300'
              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
          >
            <Medal size={16} className="inline mr-2" /> Beasiswa
          </button>
        </div>
      </div>

      <InputField
        id="notifBadge"
        label="Badge (Opsional)"
        type="text"
        value={badge}
        onChange={setBadge}
        Icon={Tag}
        placeholder="Contoh: Juara 1, Finalis"
      />

      {error && <p className="text-red-400 text-sm italic bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

      <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition font-medium"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan...' : notificationToEdit ? 'Simpan Perubahan' : 'Kirim'}
        </button>
      </div>
    </form>
  );
};

const NotificationCard: React.FC<{
  notification: Notification;
  onEdit: (notif: Notification) => void;
  onDelete: (id: string) => void;
}> = ({ notification, onEdit, onDelete }) => {
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (
      confirm(
        `Hapus notifikasi "${notification.title}"?\nAksi ini tidak bisa dikembalikan.`
      )
    ) {
      onDelete(notification.id);
    }
  };

  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wide border border-white/5 ${notification.type === 'lomba' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
              }`}>
              {notification.type === 'lomba' ? <Trophy size={10} /> : <Medal size={10} />}
              {notification.type}
            </span>
            {notification.badge && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                <Tag size={10} />
                {notification.badge}
              </span>
            )}
            <span className="text-[10px] text-slate-500 ml-auto sm:ml-0">
              {formatDate(notification.timestamp)}
            </span>
          </div>
          <h3 className="font-bold text-white text-sm md:text-base line-clamp-1 group-hover:text-blue-400 transition-colors mb-1">
            {notification.title}
          </h3>
          <p className="text-slate-400 text-xs md:text-sm line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
          <div className="mt-2 text-[10px] text-slate-600 flex items-center">
            <User size={10} className="mr-1" />
            {notification.sentBy.displayName || notification.sentBy.email}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(notification)}
            className="p-2 bg-blue-600/10 rounded-lg text-blue-400 hover:bg-blue-600 hover:text-white transition border border-blue-500/20"
            aria-label="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-red-600/10 rounded-lg text-red-400 hover:bg-red-600 hover:text-white transition border border-red-500/20"
            aria-label="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminNotif: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'lomba' | 'beasiswa'>('lomba');
  const [badge, setBadge] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ message: string; success: boolean } | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifToEdit, setNotifToEdit] = useState<Notification | null>(null);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const notifsRef = ref(rtdb, `admins/${currentUser.uid}/notifications`);
    const unsubscribe = onValue(notifsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notifList: Notification[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          badge: data[key].badge || null,
        }));
        notifList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotifications(notifList);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle || !trimmedMessage) {
      setSubmitStatus({ message: 'Judul dan pesan wajib diisi.', success: false });
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setSubmitStatus({ message: 'Anda harus login sebagai admin.', success: false });
      return;
    }

    setIsSending(true);
    setSubmitStatus(null);

    // Data notifikasi
    const notifData = {
      title: trimmedTitle,
      message: trimmedMessage,
      type,
      badge: badge.trim() || null,
      timestamp: new Date().toISOString(),
      sentBy: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
      },
    };

    try {
      // Simpan ke folder admin (untuk manajemen CRUD)
      const adminNotifRef = ref(rtdb, `admins/${currentUser.uid}/notifications`);
      const newAdminNotifRef = push(adminNotifRef);
      await set(newAdminNotifRef, notifData);

      // Simpan ke path global (untuk peserta)
      const globalNotifRef = ref(rtdb, 'notifications');
      const newGlobalNotifRef = push(globalNotifRef);
      await set(newGlobalNotifRef, {
        ...notifData,
        adminId: currentUser.uid,
      });

      setSubmitStatus({ message: 'Notifikasi berhasil dikirim!', success: true });
      setTitle('');
      setMessage('');
      setType('lomba');
      setBadge('');
    } catch (error) {
      console.error('Gagal mengirim notifikasi:', error);
      setSubmitStatus({ message: 'Gagal mengirim notifikasi. Coba lagi.', success: false });
    } finally {
      setIsSending(false);
    }
  };

  const handleEditNotification = async (data: Pick<Notification, 'title' | 'message' | 'type' | 'badge'>) => {
    if (!notifToEdit || !auth.currentUser) return;
    setIsModalSubmitting(true);
    try {
      const notifRef = ref(rtdb, `admins/${auth.currentUser.uid}/notifications/${notifToEdit.id}`);
      await update(notifRef, {
        title: data.title,
        message: data.message,
        type: data.type,
        badge: data.badge,
      });
      setIsModalOpen(false);
      setNotifToEdit(null);
    } catch (error) {
      alert('Gagal memperbarui notifikasi. Coba lagi.');
      console.error('Edit error:', error);
    } finally {
      setIsModalSubmitting(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      const notifRef = ref(rtdb, `admins/${auth.currentUser.uid}/notifications/${id}`);
      await remove(notifRef);
    } catch (error) {
      alert('Gagal menghapus notifikasi. Coba lagi.');
      console.error('Delete error:', error);
    }
  };

  const openEditModal = (notif: Notification) => {
    setNotifToEdit(notif);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      <div className="space-y-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
              <Bell className="w-6 h-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Kirim Notifikasi
            </h1>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-5">
            <InputField
              id="notifTitle"
              label="Judul Pesan"
              type="text"
              value={title}
              onChange={setTitle}
              Icon={Bell}
              placeholder="Ex: Pemenang Lomba Design"
            />
            <InputField
              id="notifMessage"
              label="Isi Pesan"
              type="textarea"
              value={message}
              onChange={setMessage}
              Icon={BookOpen}
              placeholder="Tulis pesan lengkap yang akan diterima peserta..."
            />

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Trophy size={16} className="text-blue-400" />
                Tipe Notifikasi <span className="text-red-400">*</span>
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setType('lomba')}
                  className={`flex-1 py-3 px-3 rounded-xl border text-sm font-medium transition-all duration-200 ${type === 'lomba'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                >
                  <Trophy size={16} className="inline mr-2" /> Lomba
                </button>
                <button
                  type="button"
                  onClick={() => setType('beasiswa')}
                  className={`flex-1 py-3 px-3 rounded-xl border text-sm font-medium transition-all duration-200 ${type === 'beasiswa'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                >
                  <Medal size={16} className="inline mr-2" /> Beasiswa
                </button>
              </div>
            </div>

            <InputField
              id="notifBadge"
              label="Badge (Opsional)"
              type="text"
              value={badge}
              onChange={setBadge}
              Icon={Tag}
              placeholder="Contoh: Juara 1"
              required={false}
            />

            {submitStatus && (
              <div
                className={`p-4 rounded-xl text-sm border ${submitStatus.success
                  ? 'bg-green-500/10 text-green-300 border-green-500/20'
                  : 'bg-red-500/10 text-red-300 border-red-500/20'
                  }`}
              >
                {submitStatus.message}
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={isSending || !title.trim() || !message.trim()}
                className={`px-6 py-3 flex items-center justify-center font-bold rounded-xl transition-all shadow-lg active:scale-95 ${isSending
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
                  }`}
              >
                {isSending ? (
                  <>
                    <Clock size={18} className="animate-spin" />
                    <span className="ml-2">Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span className="ml-2">Kirim Notifikasi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 px-1">
          <Clock size={18} className="text-slate-400" />
          Riwayat Notifikasi <span className="text-slate-500 text-sm font-normal">({notifications.length})</span>
        </h2>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
            <Bell size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-500 text-sm">Belum ada notifikasi yang dikirim.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onEdit={openEditModal}
                onDelete={handleDeleteNotification}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNotifToEdit(null);
        }}
        title="Edit Notifikasi"
      >
        <NotificationForm
          notificationToEdit={notifToEdit}
          onSubmit={handleEditNotification}
          onClose={() => {
            setIsModalOpen(false);
            setNotifToEdit(null);
          }}
          isSubmitting={isModalSubmitting}
        />
      </Modal>
    </div>
  );
};

export default AdminNotif;