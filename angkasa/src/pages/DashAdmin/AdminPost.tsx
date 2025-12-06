import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Calendar, LinkIcon, Image, BookOpen, Clock, MoreVertical, X } from 'lucide-react';
import type { Post } from './AdminCommon';
import { generateId, STORAGE_KEY, InputField, Modal } from './AdminCommon';

// --- Component: Post Form (Diperbaiki Validasi) ---
const PostForm: React.FC<{
  onClose: () => void;
  postToEdit?: Post | null;
  onSubmit: (post: Omit<Post, 'id' | 'createdAt'>) => void;
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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ✅ PERBAIKAN: Tanggal Penutupan TIDAK BOLEH SEBELUM Tanggal Acara
    if (new Date(closingDate) < new Date(eventDate)) {
      setError('Tanggal Penutupan Pendaftaran tidak boleh sebelum Tanggal Acara.');
      return;
    }

    // ✅ Validasi URL Gambar (opsional tapi disarankan)
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
    });
    onClose();
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
      {error && <p className="text-red-400 text-sm italic mt-2">{error}</p>}
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

// --- NEW: Full-Width Bottom Modal for Mobile Detail ---
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
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content - Slides from bottom */}
      <div className="relative w-full max-w-md bg-gray-800 border-t-4 border-slate-600 rounded-t-2xl p-4 transform transition-transform duration-300 ease-out translate-y-0">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        {/* Image - DIPERBAIKI */}
        <div className="mb-4">
          <img
            src={post.imageUrl}
            alt={`Gambar untuk ${post.title}`}
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
              target.alt = 'Gambar tidak dapat dimuat';
            }}
          />
        </div>

        {/* Content */}
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

        <a
          href={post.registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2 mb-4 bg-blue-700/30 text-blue-300 rounded-lg hover:bg-blue-600/40 transition"
        >
          <LinkIcon size={14} className="inline mr-1" />
          Buka Link Pendaftaran
        </a>

        {/* Action Buttons */}
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

// --- Component: Post Card (Updated: Remove internal modal) ---
const PostCard: React.FC<{
  post: Post;
  onMoreClick: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
}> = ({ post, onMoreClick, onEdit, onDelete }) => {
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <>
      {/* --- Mobile View (Tokopedia Style) --- */}
      <div className="sm:hidden bg-gray-800 border border-slate-700 rounded-xl p-2 flex flex-col space-y-2 hover:bg-gray-750 transition duration-200 relative">
        <div className="w-full flex-shrink-0">
          <img
            src={post.imageUrl}
            alt={`Gambar untuk ${post.title}`}
            className="w-[90%] mx-auto h-20 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
              target.alt = 'Gambar tidak dapat dimuat';
            }}
          />
        </div>
        <div className="flex-grow space-y-0.5 min-w-0">
          <h3 className="text-sm font-bold text-blue-400 line-clamp-1 break-words">{post.title}</h3>
          <p className="text-xs text-gray-300 line-clamp-2 break-words">
            {truncateText(post.description, 30)}
          </p>
        </div>
        <button
          onClick={() => onMoreClick(post)}
          className="absolute bottom-1 right-1 p-0.5 bg-gray-700/80 rounded-full text-white hover:bg-gray-600 transition shadow-sm"
          aria-label="Lihat detail"
        >
          <MoreVertical size={12} />
        </button>
      </div>

      {/* --- Desktop View --- */}
      <div className="hidden sm:block bg-gray-800 border border-slate-700 rounded-xl p-4 flex flex-col space-y-3 hover:shadow-lg hover:shadow-blue-900/30 transition duration-300 h-full relative">
        <div className="w-full flex-shrink-0">
          <img
            src={post.imageUrl}
            alt={`Gambar untuk ${post.title}`}
            className="w-full h-32 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
              target.alt = 'Gambar tidak dapat dimuat';
            }}
          />
        </div>
        <div className="flex-grow space-y-2">
          <h3 className="text-lg font-bold text-blue-400 line-clamp-1">{post.title}</h3>
          <p className="text-sm text-gray-300 line-clamp-2">{post.description}</p>
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
        </div>
        <div className="absolute bottom-2 right-2 flex space-x-1 z-10">
          <button
            onClick={() => onEdit?.(post)}
            className="p-1.5 bg-blue-600/80 rounded-full text-white hover:bg-blue-500 transition shadow-sm"
            aria-label="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete?.(post.id)}
            className="p-1.5 bg-red-600/80 rounded-full text-white hover:bg-red-500 transition shadow-sm"
            aria-label="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </>
  );
};

// --- Component: AdminPost (Diperbarui) ---
const AdminPost: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved).map((p: any) => ({
          ...p,
          eventDate: new Date(p.eventDate),
          closingDate: new Date(p.closingDate),
          createdAt: new Date(p.createdAt),
        }))
      : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const handleAddPost = (data: Omit<Post, 'id' | 'createdAt'>) => {
    const newPost: Post = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleUpdatePost = (updatedData: Omit<Post, 'id' | 'createdAt'>) => {
    if (!postToEdit) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postToEdit.id
          ? { ...updatedData, id: p.id, createdAt: p.createdAt }
          : p
      )
    );
  };

  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddClick = () => {
    setPostToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (post: Post) => {
    setPostToEdit(post);
    setIsModalOpen(true);
  };

  const handleMoreClick = (post: Post) => {
    setSelectedPostForDetail(post);
  };

  const closeDetailModal = () => {
    setSelectedPostForDetail(null);
  };

  return (
    <div className="space-y-6 relative min-h-screen pb-24">
      <h1 className="text-3xl font-extrabold text-white border-b border-slate-700 pb-3">
        Daftar Postingan ({posts.length})
      </h1>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
          <p className="text-xl text-gray-400 mb-6">Belum ada Postingan yang dibuat.</p>
          <button
            onClick={handleAddClick}
            className="p-1 bg-blue-600 rounded-full text-white shadow-xl hover:bg-blue-500 transition transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400 animate-pulse-slow"
            aria-label="Tambah Postingan Pertama"
          >
            <Plus size={36} />
          </button>
          <p className="text-sm text-gray-500 mt-4">Klik untuk membuat Postingan pertama Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4">
          {posts.map((post) => (
            <div key={post.id} className="col-span-1">
              <PostCard
                post={post}
                onMoreClick={handleMoreClick}
                onEdit={handleEditClick}
                onDelete={handleDeletePost}
              />
            </div>
          ))}
        </div>
      )}

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={handleAddClick}
          className="p-3 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 transition transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400"
          aria-label="Tambah Postingan"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Modal Tambah/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={postToEdit ? 'Edit Postingan' : 'Tambah Postingan Baru'}
      >
        <div className="max-h-[80vh] overflow-y-auto pb-6">
          <PostForm
            onClose={() => setIsModalOpen(false)}
            postToEdit={postToEdit}
            onSubmit={postToEdit ? handleUpdatePost : handleAddPost}
          />
        </div>
      </Modal>

      {/* Modal Detail dari Bawah */}
      {selectedPostForDetail && (
        <PostDetailBottomModal
          post={selectedPostForDetail}
          onClose={closeDetailModal}
          onEdit={handleEditClick}
          onDelete={handleDeletePost}
        />
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(85, 109, 247, 0.4); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s infinite; }
      `}</style>
    </div>
  );
};

export default AdminPost;