// src/pages/DashAdmin/AdminEvent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Calendar,
  LinkIcon,
  Image,
  BookOpen,
  Clock,
  MoreVertical,
  X,
  Tag,
  MessageCircle,
  Users,
} from 'lucide-react';
import type { Post } from './AdminCommon';
import { InputField, Modal, GlassCard, FloatingActionButton } from './AdminCommon';
import { ref, push, set, remove, onValue, update, get, serverTimestamp } from 'firebase/database';
import { auth, rtdb } from '../../firebase';

// COMPONENT: Post Form for Events
const EventForm: React.FC<{
  onClose: () => void;
  postToEdit?: Post | null;
  onSubmit: (data: Omit<Post, 'id' | 'createdAt'>) => void;
}> = ({ onClose, postToEdit, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: postToEdit?.title || '',
    description: postToEdit?.description || '',
    imageUrl: postToEdit?.imageUrl || '',
    eventDate: postToEdit ? postToEdit.eventDate.toISOString().split('T')[0] : '',
    closingDate: postToEdit ? postToEdit.closingDate.toISOString().split('T')[0] : '',
    registrationLink: postToEdit?.registrationLink || '',
    externalLink: postToEdit?.externalLink || '',
    type: (postToEdit?.type || 'seminar') as 'seminar' | 'acara',
    tags: postToEdit?.tags || [] as string[],
    organizer: postToEdit?.organizer || '',
    tagInput: ''
  });
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (new Date(formData.closingDate) < new Date(formData.eventDate)) {
      return setError('Tanggal Penutupan tidak boleh sebelum Tanggal Acara.');
    }

    if (formData.imageUrl.trim() && !/^https?:\/\//.test(formData.imageUrl.trim())) {
      return setError('URL Gambar harus diawali dengan https://');
    }

    if (formData.registrationLink.trim() && !/^https?:\/\//.test(formData.registrationLink.trim())) {
      return setError('Link Pendaftaran harus diawali dengan https:// atau http://');
    }

    if (formData.externalLink.trim() && !/^https?:\/\//.test(formData.externalLink.trim())) {
      return setError('Link Website/Eksternal harus diawali dengan https:// atau http://');
    }

    onSubmit({
      ...formData,
      imageUrl: formData.imageUrl.trim() || 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Event+Image',
      eventDate: new Date(formData.eventDate),
      closingDate: new Date(formData.closingDate),
      registrationLink: formData.registrationLink || '#',
      externalLink: formData.externalLink || '',
      organizer: formData.organizer || 'Universitas', 
    });
    onClose();
  };

  const handleTag = (action: 'add' | 'remove', value?: any) => {
    if (action === 'add') {
      if (!formData.tagInput.trim()) return;
      if (formData.tags.includes(formData.tagInput.trim())) return setError('Tag sudah ada.');
      setFormData(prev => ({ ...prev, tags: [...prev.tags, prev.tagInput.trim()], tagInput: '' }));
    } else {
      setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== value) }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField id="title" label="Nama Event" type="text" value={formData.title} onChange={v => updateField('title', v)} Icon={BookOpen} placeholder="Judul..." />
      <InputField id="description" label="Deskripsi" type="textarea" value={formData.description} onChange={v => updateField('description', v)} Icon={BookOpen} placeholder="Deskripsi lengkap..." />
      <InputField id="imageUrl" label="URL Banner" type="url" value={formData.imageUrl} onChange={v => updateField('imageUrl', v)} required={false} Icon={Image} placeholder="https://..." />
      <InputField id="organizer" label="Penyelenggara" type="text" value={formData.organizer} onChange={v => updateField('organizer', v)} Icon={Users} placeholder="Nama Universitas / Organisasi..." />

      <div className="space-y-2">
        <label className="text-xs md:text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Tag size={16} className="text-blue-400" /> Kategori Event <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          {(['seminar', 'acara'] as const).map(t => (
            <button
              key={t} type="button" onClick={() => updateField('type', t)}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${formData.type === t
                ? t === 'seminar' ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                : 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs md:text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Tag size={16} className="text-blue-400" /> Hashtag
        </label>
        <div className="flex gap-2">
          <input
            type="text" value={formData.tagInput} onChange={(e) => updateField('tagInput', e.target.value)}
            placeholder="Contoh: #webinar"
            className="flex-1 min-w-0 px-4 py-3 border border-white/10 bg-white/5 text-white text-sm rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-200 placeholder:text-slate-500"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleTag('add'))}
          />
          <button type="button" onClick={() => handleTag('add')} className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors font-medium">+</button>
        </div>

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {formData.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-slate-800 border border-white/10 text-slate-300 text-xs rounded-full flex items-center gap-1.5">
                #{tag} <button type="button" onClick={() => handleTag('remove', i)} className="hover:text-white transition-colors">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField id="eventDate" label="Tanggal Acara" type="date" value={formData.eventDate} onChange={v => updateField('eventDate', v)} Icon={Calendar} />
        <InputField id="closingDate" label="Penutupan Reg." type="date" value={formData.closingDate} onChange={v => updateField('closingDate', v)} Icon={Clock} />
      </div>

      <InputField id="regLink" label="Link Pendaftaran" type="url" value={formData.registrationLink} onChange={v => updateField('registrationLink', v)} Icon={LinkIcon} placeholder="https://..." />
      <InputField id="extLink" label="Link Website" type="url" value={formData.externalLink} onChange={v => updateField('externalLink', v)} Icon={LinkIcon} placeholder="https://..." />

      {error && <p className="text-red-400 text-sm italic bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

      <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-sm font-medium transition-colors">Batal</button>
        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 text-sm shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5">
          {postToEdit ? 'Simpan Perubahan' : 'Buat Event'}
        </button>
      </div>
    </form>
  );
};

// COMPONENT: Post Detail Bottom Modal
const EventDetailBottomModal: React.FC<{
  post: Post;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}> = ({ post, onClose, onEdit, onDelete }) => {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus event "${post.title}"?`)) {
      onDelete(post.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/80 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-slate-900 border-t border-white/10 rounded-t-3xl p-6 transform transition-transform animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-700 rounded-full mb-4"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <X size={24} />
        </button>

        <div className="mt-4 mb-5">
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg mb-4 bg-slate-800 relative aspect-video">
            <img
              src={post.imageUrl}
              alt={`Gambar untuk ${post.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
              }}
            />
            <div className={`absolute top-2 right-2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/10`}>
              {post.type}
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">{post.title}</h2>

          <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-blue-400" />
              <span className="font-medium text-slate-200">Waktu: {formatDate(post.eventDate)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-red-400" />
              <span className="font-medium text-slate-200">Tutup: {formatDate(post.closingDate)}</span>
            </div>
          </div>

          <p className="text-slate-300 mb-6 whitespace-pre-line leading-relaxed text-sm md:text-base">{post.description}</p>

          <a
            href={post.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 mb-4 bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold rounded-xl hover:bg-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <LinkIcon size={16} className="inline mr-2" />
            Link Pendaftaran
          </a>

          <div className="flex space-x-3 pt-2 border-t border-white/10">
            <button
              onClick={() => {
                onEdit(post);
                onClose();
              }}
              className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition font-medium border border-white/5"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-600/30 transition font-medium"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// COMPONENT: Participant List Modal
const ParticipantListModal: React.FC<{
  post: Post;
  onClose: () => void;
}> = ({ post, onClose }) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const participantsRef = ref(rtdb, `posts/${post.id}/participants`);
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setParticipants(Object.values(data));
      } else {
        setParticipants([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [post.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 transition-opacity" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={24} className="text-blue-400" />
              Daftar Peserta
            </h2>
            <p className="text-sm text-slate-400 mt-1">{post.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
              <Users size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">Belum ada peserta yang mendaftar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participants.map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-white">{p.name}</h4>
                        <p className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md inline-block mt-1">{p.role}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                        {new Date(p.registeredAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center opacity-50">🏢</span>
                        <span className="truncate">{p.institution}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center opacity-50">📞</span>
                        <span>{p.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// COMPONENT: Event Card
const EventCard: React.FC<{
  post: Post;
  onMoreClick: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
  onViewParticipants?: (post: Post) => void;
}> = ({ post, onMoreClick, onEdit, onDelete, onViewParticipants }) => {

  const truncateWords = (text: string, wordCount: number) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length > wordCount) {
      return words.slice(0, wordCount).join(' ') + '...';
    }
    return text;
  };

  return (
    <GlassCard className="h-full flex flex-col !p-0 overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
      {/* Image Section */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-800">
        <img
          src={post.imageUrl}
          alt={`Gambar untuk ${post.title}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
          }}
        />
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wide backdrop-blur-md border border-white/10 ${post.type === 'seminar' ? 'bg-blue-600/80 text-white' : 'bg-yellow-500/90 text-slate-900'
            }`}>
            {post.type}
          </span>
        </div>

        {/* Mobile: More Button Overlay */}
        <button
          onClick={() => onMoreClick(post)}
          className="sm:hidden absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm text-white rounded-lg border border-white/10"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-base font-bold text-white line-clamp-1 mb-1 group-hover:text-blue-400 transition-colors">{post.title}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{truncateWords(post.description, 8)}</p>

        <div className="mt-auto">
          <div className="flex justify-between items-center text-[10px] font-medium text-slate-500 mb-3 border-t border-white/5 pt-3">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1.5" />
              {new Date(post.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </div>
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onViewParticipants?.(post)}
              className="flex-1 py-1.5 bg-blue-600/10 text-blue-400 text-xs rounded-lg hover:bg-blue-600 hover:text-white transition border border-blue-500/20"
            >
              <Users size={14} className="inline mr-1" />
              Peserta
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit?.(post)}
                className="p-1.5 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition border border-blue-500/20"
                aria-label="Edit"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete?.(post.id)}
                className="p-1.5 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition border border-red-500/20"
                aria-label="Hapus"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Mobile Action Buttons (Simplified) */}
          <div className="flex sm:hidden items-center gap-2">
            <button
               onClick={() => onViewParticipants?.(post)}
               className="flex-1 py-2 bg-white/5 text-slate-300 text-xs rounded-lg hover:bg-white/10 transition border border-white/5"
            >
              <Users size={14} className="inline mr-1" /> Peserta
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// MAIN: AdminEvent
const AdminEvent: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [selectedPostForParticipants, setSelectedPostForParticipants] = useState<Post | null>(null);

  const loadPosts = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const adminPostsRef = ref(rtdb, `admins/${currentUser.uid}/posts`);
    const unsubscribe = onValue(adminPostsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const adminData = snapshot.val();
      const postIds = Object.keys(adminData);

      const fullPosts = await Promise.all(
        postIds.map(async (id) => {
          const globalSnap = await get(ref(rtdb, `posts/${id}`));
          if (!globalSnap.exists()) return null; // Skip if main post deleted
          
          return {
            id,
            ...adminData[id],
            eventDate: new Date(adminData[id].eventDate),
            closingDate: new Date(adminData[id].closingDate),
            createdAt: new Date(adminData[id].createdAt),
          };
        })
      );

      // Filter and sort
      const validPosts = fullPosts
        .filter((p): p is Post => p !== null && (p.type === 'seminar' || p.type === 'acara'))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setPosts(validPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleAddPost = async (data: Omit<Post, 'id' | 'createdAt'>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const globalPostsRef = ref(rtdb, 'posts');
      const newPostRef = push(globalPostsRef);
      const postId = newPostRef.key!;
      if (!postId) throw new Error('Failed to generate post ID');

      await set(newPostRef, {
        id: postId,
        author: currentUser.displayName || 'Admin',
        authorId: currentUser.uid,
        avatar: '',
        title: data.title,
        content: data.description,
        image: data.imageUrl,
        type: data.type,
        category: data.type,
        organizer: data.organizer,
        tags: data.tags || [],
        registrationLink: data.registrationLink,
        externalLink: data.externalLink,
        eventDate: data.eventDate.toISOString(),
        closingDate: data.closingDate.toISOString(),
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: {},
        comments: {},
      });

      await set(ref(rtdb, `admins/${currentUser.uid}/posts/${postId}`), {
        ...data,
        createdAt: new Date().toISOString(),
        eventDate: data.eventDate.toISOString(),
        closingDate: data.closingDate.toISOString(),
      });

      // AUTOMATED NOTIFICATION TRIGGER
      try {
        const notifData = {
          title: `Event Baru: ${data.title}`,
          message: `${data.type} "${data.title}" akan segera dimulai. Cek detailnya sekarang!`,
          type: data.type,
          badge: 'Baru',
          timestamp: new Date().toISOString(),
          sentBy: {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'Admin',
          },
        };

        const adminNotifRef = ref(rtdb, `admins/${currentUser.uid}/notifications`);
        await push(adminNotifRef, notifData);

        const globalNotifRef = ref(rtdb, 'notifications');
        await push(globalNotifRef, {
          ...notifData,
          adminId: currentUser.uid,
          relatedPostId: postId,
        });
      } catch (notifError) {
        console.error('Failed to send auto-notification:', notifError);
      }
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Gagal menambahkan event.');
    }
  };

  const handleUpdatePost = async (data: Omit<Post, 'id' | 'createdAt'>) => {
    if (!postToEdit) return;
    try {
      await update(ref(rtdb, `admins/${auth.currentUser?.uid}/posts/${postToEdit.id}`), {
        ...data,
        eventDate: data.eventDate.toISOString(),
        closingDate: data.closingDate.toISOString(),
      });
      await update(ref(rtdb, `posts/${postToEdit.id}`), {
        title: data.title,
        content: data.description,
        image: data.imageUrl,
        eventDate: data.eventDate.toISOString(),
        closingDate: data.closingDate.toISOString(),
        registrationLink: data.registrationLink,
        externalLink: data.externalLink,
        type: data.type,
        organizer: data.organizer,
        tags: data.tags || [],
        category: data.type,
      });
    } catch (error) {
      console.error('Error update:', error);
      alert('Gagal memperbarui event.');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      await remove(ref(rtdb, `admins/${auth.currentUser?.uid}/posts/${id}`));
      await remove(ref(rtdb, `posts/${id}`));
    } catch (error) {
      console.error('Error delete:', error);
      alert('Gagal menghapus event.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-24 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-white/10 pb-4 sticky top-0 bg-slate-950/80 backdrop-blur-md z-30 pt-4 -mt-4 px-4 -mx-4">
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <Calendar size={24} className="text-blue-400" />
          Event & Seminar
        </h1>
        <button
          onClick={() => {
            setPostToEdit(null);
            setIsModalOpen(true);
          }}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 active:scale-95 duration-200"
        >
          <Plus size={20} />
          <span>Buat Event</span>
        </button>
      </div>

      {posts.length === 0 ? (
        <GlassCard className="text-center py-20 flex flex-col items-center justify-center border-dashed border-white/10 !bg-transparent">
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
            <Calendar size={40} className="text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Belum ada event</h3>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto">Mulai bagikan informasi seminar atau acara untuk pengguna aplikasi.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 rounded-xl text-white font-bold shadow-lg hover:bg-blue-500 transition-transform hover:-translate-y-1"
          >
            Buat Event Pertama
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="h-full">
              <EventCard
                post={post}
                onMoreClick={setSelectedPostForDetail}
                onEdit={(post) => {
                  setPostToEdit(post);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeletePost}
                onViewParticipants={setSelectedPostForParticipants}
              />
            </div>
          ))}
        </div>
      )}

      <div className="sm:hidden">
        <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={postToEdit ? "Edit Event" : "Buat Event Baru"}
      >
        <EventForm
          onClose={() => setIsModalOpen(false)}
          postToEdit={postToEdit}
          onSubmit={postToEdit ? handleUpdatePost : handleAddPost}
        />
      </Modal>

      {selectedPostForParticipants && (
        <ParticipantListModal
          post={selectedPostForParticipants}
          onClose={() => setSelectedPostForParticipants(null)}
        />
      )}

      {selectedPostForDetail && (
        <EventDetailBottomModal
          post={selectedPostForDetail}
          onClose={() => setSelectedPostForDetail(null)}
          onEdit={(post) => {
            setPostToEdit(post);
            setIsModalOpen(true);
          }}
          onDelete={handleDeletePost}
        />
      )}
    </div>
  );
};

export default AdminEvent;
