// src/components/admin/AdminPost.tsx
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
} from 'lucide-react';
import type { Post } from './AdminCommon';
import { InputField, Modal } from './AdminCommon';
import { ref, push, set, remove, onValue, update, get, serverTimestamp } from 'firebase/database';
import { auth, rtdb } from '../../firebase';

// ======================
// COMPONENT: Post Form
// ======================
const PostForm: React.FC<{
  onClose: () => void;
  postToEdit?: Post | null;
  onSubmit: (data: Omit<Post, 'id' | 'createdAt'>) => void;
}> = ({ onClose, postToEdit, onSubmit }) => {
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [description, setDescription] = useState(postToEdit?.description || '');
  const [imageUrl, setImageUrl] = useState(postToEdit?.imageUrl || '');
  const [eventDate, setEventDate] = useState(
    postToEdit ? postToEdit.eventDate.toISOString().split('T')[0] : ''
  );
  const [closingDate, setClosingDate] = useState(
    postToEdit ? postToEdit.closingDate.toISOString().split('T')[0] : ''
  );
  const [registrationLink, setRegistrationLink] = useState(postToEdit?.registrationLink || '');
  const [type, setType] = useState<'lomba' | 'beasiswa'>(
    postToEdit?.type || 'lomba'
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(
    postToEdit?.tags || []
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (new Date(closingDate) < new Date(eventDate)) {
      setError('Tanggal Penutupan Pendaftaran tidak boleh sebelum Tanggal Acara.');
      return;
    }

    if (imageUrl.trim() && !/^https?:\/\//.test(imageUrl.trim())) {
      setError('URL Gambar harus diawali dengan https://');
      return;
    }

    onSubmit({
      title,
      description,
      imageUrl: imageUrl.trim() || 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Post+Image',
      eventDate: new Date(eventDate),
      closingDate: new Date(closingDate),
      registrationLink: registrationLink || '#',
      type,
      tags,
    });
    onClose();
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (tags.includes(tagInput.trim())) {
      setError('Tag sudah ada.');
      return;
    }
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        id="title"
        label="Judul Postingan"
        type="text"
        value={title}
        onChange={setTitle}
        Icon={BookOpen}
      />
      <InputField
        id="description"
        label="Deskripsi"
        type="textarea"
        value={description}
        onChange={setDescription}
        Icon={BookOpen}
      />
      <InputField
        id="imageUrl"
        label="URL Gambar (Opsional, wajib https://)"
        type="url"
        value={imageUrl}
        onChange={setImageUrl}
        required={false}
        Icon={Image}
      />

      <div className="space-y-1">
        <label htmlFor="type" className="text-sm font-medium text-white flex items-center">
          <Tag size={16} className="mr-2 text-blue-400" />
          Tipe Postingan <span className="text-red-400 ml-1">*</span>
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setType('lomba')}
            className={`flex-1 py-2 px-3 rounded-lg border transition ${
              type === 'lomba'
                ? 'bg-blue-700/50 border-blue-500 text-blue-300'
                : 'bg-gray-800 border-slate-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Tag size={16} className="inline mr-1" /> Lomba
          </button>
          <button
            type="button"
            onClick={() => setType('beasiswa')}
            className={`flex-1 py-2 px-3 rounded-lg border transition ${
              type === 'beasiswa'
                ? 'bg-purple-700/50 border-purple-500 text-purple-300'
                : 'bg-gray-800 border-slate-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Tag size={16} className="inline mr-1" /> Beasiswa
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="tagInput" className="text-sm font-medium text-white flex items-center">
          <Tag size={16} className="mr-2 text-blue-400" />
          Hashtag (Opsional)
        </label>
        <div className="flex gap-2">
          <input
            id="tagInput"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Contoh: #desain, #nasional, #mahasiswa"
            className="flex-1 px-4 py-2 border border-slate-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition duration-150"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            +
          </button>
        </div>
        {error && error.startsWith('Tag') && (
          <p className="text-red-400 text-sm italic mt-1">{error}</p>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="px-2.5 py-1 bg-slate-700/40 text-slate-300 text-xs rounded-full flex items-center gap-1"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 text-slate-400 hover:text-slate-200"
                aria-label={`Hapus tag ${tag}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <InputField
        id="eventDate"
        label="Tanggal Acara"
        type="date"
        value={eventDate}
        onChange={setEventDate}
        Icon={Calendar}
      />
      <InputField
        id="closingDate"
        label="Tanggal Penutupan Pendaftaran"
        type="date"
        value={closingDate}
        onChange={setClosingDate}
        Icon={Clock}
      />
      <InputField
        id="regLink"
        label="Link Pendaftaran"
        type="url"
        value={registrationLink}
        onChange={setRegistrationLink}
        Icon={LinkIcon}
      />
      {error && !error.startsWith('Tag') && (
        <p className="text-red-400 text-sm italic mt-2">{error}</p>
      )}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition shadow-md shadow-blue-800/50"
        >
          {postToEdit ? 'Simpan Perubahan' : 'Tambah Postingan'}
        </button>
      </div>
    </form>
  );
};

// ======================
// COMPONENT: Post Detail Bottom Modal
// ======================
const PostDetailBottomModal: React.FC<{
  post: Post;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}> = ({ post, onClose, onEdit, onDelete }) => {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus postingan "${post.title}"?`)) {
      onDelete(post.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-gray-800 border-t-4 border-slate-600 rounded-t-2xl p-4 transform transition-transform duration-300 ease-out translate-y-0">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        <div className="mb-4">
          <img
            src={post.imageUrl}
            alt={`Gambar untuk ${post.title}`}
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
            }}
          />
        </div>

        <h2 className="text-xl font-bold text-blue-400 mb-2">{post.title}</h2>
        <p className="text-gray-300 mb-4 whitespace-pre-line">{post.description}</p>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
          <div className="flex items-center">
            <Calendar size={14} className="mr-2 text-blue-400" />
            <span>{formatDate(post.eventDate)}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-2 text-blue-400" />
            <span>{formatDate(post.closingDate)}</span>
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-700/40 text-slate-300 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <a
          href={post.registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2 mb-4 bg-blue-700/30 text-blue-300 rounded-lg hover:bg-blue-600/40 transition"
        >
          <LinkIcon size={14} className="inline mr-1" />
          Buka Link Pendaftaran
        </a>

        <div className="flex space-x-2">
          <button
            onClick={() => {
              onEdit(post);
              onClose();
            }}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================
// COMPONENT: Comment Slide Panel (Aman 100%)
// ======================
const CommentSlidePanel: React.FC<{
  post: Post;
  onClose: () => void;
  onReply: (text: string, parentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}> = ({ post, onClose, onReply, onDeleteComment }) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // ✅ Filter komentar yang punya id
  const validComments = Object.values(post.comments || {})
    .filter(c => c && typeof c === 'object' && c.id && typeof c.id === 'string');

  const commentsArray = validComments.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSendReply = (parentId: string) => {
    if (!parentId || !replyText.trim()) {
      console.warn('Cannot send reply: missing parentId or text');
      return;
    }
    onReply(replyText.trim(), parentId);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleDeleteClick = (commentId: string) => {
    if (commentId && confirm("Hapus komentar ini?")) {
      onDeleteComment(commentId);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      <div className="absolute right-0 top-0 w-full max-w-md h-full bg-gray-800 border-l border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">Komentar ({commentsArray.length})</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {commentsArray.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada komentar.</p>
          ) : (
            commentsArray.map((comment) => (
              <div key={comment.id} className="bg-gray-700/30 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-blue-300 text-sm">{comment.author}</span>
                  <span className="text-xs text-gray-500">
                    {typeof comment.timestamp === 'string'
                      ? new Date(comment.timestamp).toLocaleString('id-ID')
                      : '--'}
                  </span>
                </div>
                <p className="text-gray-200 text-sm mb-2">{comment.text}</p>

                {/* ✅ Pastikan comment.id ada */}
                {comment.id ? (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Balas
                    </button>
                    <button
                      onClick={() => handleDeleteClick(comment.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Hapus
                    </button>
                  </div>
                ) : null}

                {replyingTo === comment.id && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Tulis balasan..."
                      className="flex-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply(comment.id)}
                    />
                    <button
                      onClick={() => handleSendReply(comment.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                    >
                      Kirim
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ======================
// COMPONENT: Post Card
// ======================
const PostCard: React.FC<{
  post: Post;
  onMoreClick: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
  onCommentClick?: (post: Post) => void;
}> = ({ post, onMoreClick, onEdit, onDelete, onCommentClick }) => {
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden bg-gray-800 border border-slate-700 rounded-xl p-2 flex flex-col space-y-2 hover:bg-gray-750 transition duration-200 relative">
        <div className="w-full flex-shrink-0">
          <img
            src={post.imageUrl}
            alt={`Gambar untuk ${post.title}`}
            className="w-full h-24 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
            }}
          />
        </div>
        <div className="flex-grow space-y-1 min-w-0">
          <h3 className="text-sm font-bold text-blue-400 line-clamp-1">{post.title}</h3>
          <p className="text-xs text-gray-300 line-clamp-2">{truncateText(post.description, 40)}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-slate-700/40 text-slate-300 text-xs rounded">
                  #{tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="px-1.5 py-0.5 bg-slate-700/40 text-slate-300 text-xs rounded">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}
          <div className="text-xs text-gray-400 flex items-center">
            <MessageCircle size={12} className="mr-1" />
            {post.commentCount || 0}
          </div>
        </div>
        <div className="absolute bottom-2 right-2 flex space-x-1">
          <button
            onClick={() => onCommentClick?.(post)}
            className="p-1 bg-slate-700 rounded text-white hover:bg-slate-600"
            aria-label="Komentar"
          >
            <MessageCircle size={12} />
          </button>
          <button
            onClick={() => onMoreClick(post)}
            className="p-1 bg-gray-700 rounded text-white hover:bg-gray-600"
            aria-label="Lainnya"
          >
            <MoreVertical size={12} />
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block bg-gray-800 border border-slate-700 rounded-xl p-4 flex flex-col space-y-3 hover:shadow-lg hover:shadow-blue-900/30 transition h-full relative">
        <div className="w-full flex-shrink-0">
          <img
            src={post.imageUrl}
            alt={`Gambar untuk ${post.title}`}
            className="w-full h-32 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
            }}
          />
        </div>
        <div className="flex-grow space-y-2">
          <h3 className="text-lg font-bold text-blue-400 line-clamp-1">{post.title}</h3>
          <p className="text-sm text-gray-300 line-clamp-2">{post.description}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-700/40 text-slate-300 text-xs rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
            <p className="flex items-center">
              <Calendar size={12} className="mr-1 text-blue-400" /> {post.eventDate.toLocaleDateString('id-ID')}
            </p>
            <p className="flex items-center">
              <Clock size={12} className="mr-1 text-blue-400" /> {post.closingDate.toLocaleDateString('id-ID')}
            </p>
          </div>
          <a
            href={post.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-400 text-xs flex items-center"
          >
            <LinkIcon size={12} className="mr-1" /> Link Pendaftaran
          </a>
          <div className="text-xs text-gray-400 flex items-center mt-1">
            <MessageCircle size={12} className="mr-1" />
            {post.commentCount || 0} komentar
          </div>
          <button
            onClick={() => onCommentClick?.(post)}
            className="w-full py-1.5 mt-1 bg-slate-700/50 text-slate-300 text-xs rounded hover:bg-slate-600 transition"
          >
            Lihat & Balas Komentar
          </button>
        </div>
        <div className="absolute bottom-2 right-2 flex space-x-1 z-10">
          <button
            onClick={() => onEdit?.(post)}
            className="p-1.5 bg-blue-600/80 rounded-full text-white hover:bg-blue-500"
            aria-label="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete?.(post.id)}
            className="p-1.5 bg-red-600/80 rounded-full text-white hover:bg-red-500"
            aria-label="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </>
  );
};

// ======================
// MAIN: AdminPost
// ======================
const AdminPost: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);

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
          const globalData = globalSnap.exists() ? globalSnap.val() : {};

          const safeComments: Record<string, any> = {};
          if (globalData.comments) {
            for (const [key, comment] of Object.entries(globalData.comments)) {
              if (comment && typeof comment === 'object') {
                // ✅ Selalu pastikan comment punya id
                safeComments[key] = {
                  ...comment,
                  id: comment.id || key, // fallback ke key jika id hilang
                };
              }
            }
          }

          return {
            id,
            ...adminData[id],
            commentCount: Object.keys(safeComments).length,
            comments: safeComments,
            eventDate: new Date(adminData[id].eventDate),
            closingDate: new Date(adminData[id].closingDate),
            createdAt: new Date(adminData[id].createdAt),
          };
        })
      );

      fullPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setPosts(fullPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 🔥 Balas Komentar (Aman)
  const handleReplyToComment = async (postId: string, replyText: string, parentId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !postId || !parentId || !replyText.trim()) {
      console.warn('❌ Invalid reply data:', { postId, parentId, replyText });
      return;
    }

    try {
      const commentsRef = ref(rtdb, `posts/${postId}/comments`);
      const newCommentRef = push(commentsRef);
      const newId = newCommentRef.key;
      if (!newId) throw new Error('Failed to generate comment ID');

      await set(newCommentRef, {
        id: newId,
        author: currentUser.displayName || 'Admin',
        authorId: currentUser.uid,
        text: replyText.trim(),
        timestamp: serverTimestamp() as unknown as string,
        parentId: parentId, // ✅ pasti string
      });
    } catch (error) {
      console.error('Error replying to comment:', error);
      alert('Gagal membalas komentar. Coba lagi.');
    }
  };

  // 🔥 Hapus Komentar
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!postId || !commentId) return;
    try {
      await remove(ref(rtdb, `posts/${postId}/comments/${commentId}`));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Gagal menghapus komentar.');
    }
  };

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
        category: data.type === 'lomba' ? 'lomba' : 'beasiswa',
        tags: data.tags || [],
        registrationLink: data.registrationLink,
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
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Gagal menambahkan postingan.');
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
        type: data.type,
        tags: data.tags || [],
        category: data.type === 'lomba' ? 'lomba' : 'beasiswa',
      });
    } catch (error) {
      console.error('Error update:', error);
      alert('Gagal memperbarui postingan.');
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await remove(ref(rtdb, `admins/${auth.currentUser?.uid}/posts/${id}`));
      await remove(ref(rtdb, `posts/${id}`));
    } catch (error) {
      console.error('Error delete:', error);
      alert('Gagal menghapus postingan.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="space-y-6 relative min-h-screen pb-24 p-4 sm:p-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-white border-b border-slate-700 pb-3">
        Daftar Postingan ({posts.length})
      </h1>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-6">Belum ada postingan.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-3 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 transition"
            aria-label="Tambah Postingan"
          >
            <Plus size={24} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="col-span-1">
              <PostCard
                post={post}
                onMoreClick={setSelectedPostForDetail}
                onEdit={setPostToEdit}
                onDelete={handleDeletePost}
                onCommentClick={setSelectedPostForComments}
              />
            </div>
          ))}
        </div>
      )}

      <div className="fixed sm:hidden bottom-6 right-6 z-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-4 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 transition"
          aria-label="Tambah Postingan"
        >
          <Plus size={24} />
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={postToEdit ? 'Edit Postingan' : 'Tambah Postingan Baru'}
      >
        <div className="max-h-[80vh] overflow-y-auto p-2">
          <PostForm
            onClose={() => setIsModalOpen(false)}
            postToEdit={postToEdit}
            onSubmit={postToEdit ? handleUpdatePost : handleAddPost}
          />
        </div>
      </Modal>

      {selectedPostForDetail && (
        <PostDetailBottomModal
          post={selectedPostForDetail}
          onClose={() => setSelectedPostForDetail(null)}
          onEdit={setPostToEdit}
          onDelete={handleDeletePost}
        />
      )}

      {selectedPostForComments && (
        <CommentSlidePanel
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onReply={handleReplyToComment}
          onDeleteComment={(commentId) => handleDeleteComment(selectedPostForComments.id, commentId)}
        />
      )}
    </div>
  );
};

export default AdminPost;