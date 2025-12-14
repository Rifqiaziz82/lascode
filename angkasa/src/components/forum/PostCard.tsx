import { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, Trophy, GraduationCap, Copy, MessageSquareIcon, Clock, Link, Info, X, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types (reused from ForumFeed)
interface Comment {
  id: string;
  author: string;
  authorId: string;
  text: string;
  timestamp: string | number;
  parentId?: string;
}

export interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: Record<string, Comment>;
  timestamp: string;
  category: 'lomba' | 'beasiswa';
  title?: string;
  type: 'lomba' | 'beasiswa';
  tags: string[];
  registrationLink: string;
  externalLink?: string;
  details?: { title: string; description: string }[];
  eventDate: string;
  closingDate: string;
  likedBy?: Record<string, boolean>;
}

interface PostCardProps {
  post: Post;
  currentUser: any;
  onLike: (postId: string) => void;
  onCommentSubmit: (postId: string, text: string) => void;
  onReplySubmit: (postId: string, text: string, parentId: string) => void;
}

export default function PostCard({ post, currentUser, onLike, onCommentSubmit, onReplySubmit }: PostCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetailIndex, setSelectedDetailIndex] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const allComments = Object.values(post.comments || {});
  const topLevel = allComments.filter(c => !c.parentId);
  const replies: Record<string, Comment[]> = {};
  allComments.forEach(c => {
    if (c.parentId) {
      if (!replies[c.parentId]) replies[c.parentId] = [];
      replies[c.parentId].push(c);
    }
  });

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} hari yang lalu`;
    if (diffHours > 0) return `${diffHours} jam yang lalu`;
    if (diffMins > 0) return `${diffMins} menit yang lalu`;
    return 'Baru saja';
  };

  const copyLink = () => {
    const url = `${window.location.origin}/forum#${post.id}`;
    navigator.clipboard.writeText(url).catch(console.error);
    setIsShareOpen(false);
  };

  const shareToWhatsApp = () => {
    const url = `${window.location.origin}/forum#${post.id}`;
    const text = `Lihat di Angkasa: ${post.title || 'Postingan menarik'}\n"${post.content.substring(0, 80)}..."`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
    setIsShareOpen(false);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-colors shadow-lg"
      >
        {/* Header */}
        <div className="p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-slate-100">{post.author}</h4>
                {post.type === 'lomba' ? (
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                    <Trophy size={10} /> Lomba
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                    <GraduationCap size={10} /> Beasiswa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                {getRelativeTime(post.timestamp)}
              </p>
            </div>
          </div>

          {/* Registration Deadline Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/50 rounded-full border border-slate-700/50">
            <Clock size={12} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-300">
              {new Date(post.closingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-2">
          {post.title && (
            <h3 className="text-lg font-bold text-white mb-2 leading-tight">
              {post.title}
            </h3>
          )}
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
            {post.content}
          </p>

          {post.image && (
            <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-900/50 border border-slate-700/30">
              <img
                src={post.image}
                alt={post.title}
                className="w-full object-cover max-h-[400px]"
                loading="lazy"
              />
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full border border-slate-700/50 hover:border-slate-500 bg-transparent hover:bg-slate-800/30 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all duration-200 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-t border-slate-700/30 bg-slate-800/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-2 text-sm transition-colors ${post.likedBy?.[currentUser?.id]
                ? 'text-pink-500'
                : 'text-slate-400 hover:text-pink-400'
                }`}
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-95 ${post.likedBy?.[currentUser?.id] ? 'fill-current' : ''
                  }`}
              />
              <span className="font-medium">{post.likes || 0}</span>
            </button>

            <button
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className={`flex items-center gap-2 text-sm transition-colors ${isCommentsOpen ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{allComments.length}</span>
            </button>

            {post.registrationLink && post.registrationLink !== '#' && (
              <a
                href={post.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                title={`Link ${post.type === 'lomba' ? 'Lomba' : 'Beasiswa'}`}
              >
                <Link className="w-5 h-5" />
              </a>
            )}

            {post.details && post.details.length > 0 && (
              <button
                onClick={() => setIsDetailsOpen(true)}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20"
              >
                <Info className="w-4 h-4" />
                <span className="font-bold text-xs">Lihat Detail</span>
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsShareOpen(!isShareOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {isShareOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-20"
                >
                  <div className="p-1">
                    <button onClick={copyLink} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 rounded-lg text-left">
                      <Copy size={14} /> Salin Tautan
                    </button>
                    <button onClick={shareToWhatsApp} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 rounded-lg text-left">
                      <MessageSquareIcon size={14} /> WhatsApp
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Comment Section */}
        <AnimatePresence>
          {isCommentsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-700/30 bg-slate-900/20"
            >
              <div className="p-4 space-y-4">
                {/* Comment Input */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (onCommentSubmit(post.id, commentText), setCommentText(''))}
                      placeholder="Tulis komentar..."
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder-slate-500"
                    />
                    <button
                      onClick={() => { onCommentSubmit(post.id, commentText); setCommentText(''); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      disabled={!commentText.trim()}
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {topLevel.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 text-sm">Belum ada komentar. Jadilah yang pertama!</div>
                  ) : (
                    topLevel.map(comment => (
                      <div key={comment.id} className="group">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 mt-1">
                            {comment.author.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="bg-slate-800/40 rounded-2xl rounded-tl-none px-4 py-2 border border-slate-700/30">
                              <div className="flex items-baseline justify-between">
                                <span className="text-xs font-bold text-slate-300">{comment.author}</span>
                                <span className="text-[10px] text-slate-600">
                                  {typeof comment.timestamp === 'string' ? new Date(comment.timestamp).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 mt-0.5">{comment.text}</p>
                            </div>

                            <div className="flex items-center gap-3 mt-1 ml-2">
                              <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="text-xs text-slate-500 hover:text-blue-400 font-medium"
                              >
                                Balas
                              </button>
                            </div>

                            {/* Reply Input */}
                            {replyingTo === comment.id && (
                              <div className="mt-2 flex gap-2 animate-in fade-in slide-in-from-top-1">
                                <input
                                  type="text"
                                  placeholder={`Balas ${comment.author}...`}
                                  className="flex-1 bg-slate-800/30 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = (e.target as HTMLInputElement).value;
                                      onReplySubmit(post.id, val, comment.id);
                                      setReplyingTo(null);
                                    }
                                  }}
                                />
                              </div>
                            )}

                            {/* Replies */}
                            {replies[comment.id]?.map(reply => (
                              <div key={reply.id} className="mt-2 ml-2 flex gap-3 pl-3 border-l-2 border-slate-700/30">
                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 mt-1">
                                  {reply.author.charAt(0)}
                                </div>
                                <div>
                                  <div className="bg-slate-800/30 rounded-xl rounded-tl-none px-3 py-2 border border-slate-700/20">
                                    <span className="text-xs font-bold text-slate-400 block">{reply.author}</span>
                                    <p className="text-xs text-slate-300">{reply.text}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-start bg-slate-900/50 backdrop-blur-md">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Detail & Klasifikasi
                  </h2>
                  <p className="text-sm text-slate-400">
                    Pilih kategori di bawah untuk melihat detail lengkap.
                  </p>
                </div>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sidebar / List (Mobile: Top, Desktop: Left) */}
                  <div className="md:col-span-1 space-y-2">
                    {post.details?.map((detail, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDetailIndex(index)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${selectedDetailIndex === index
                            ? 'bg-blue-600/20 border-blue-500/50 text-white'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        <span className="font-medium text-sm truncate">{detail.title}</span>
                        {selectedDetailIndex === index && (
                          <ChevronRight size={16} className="text-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Content Area */}
                  <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 min-h-[300px] flex flex-col">
                    {selectedDetailIndex !== null && post.details ? (
                      <motion.div
                        key={selectedDetailIndex}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col"
                      >
                        <h3 className="text-lg font-bold text-white mb-3 pb-3 border-b border-white/10">
                          {post.details[selectedDetailIndex].title}
                        </h3>
                        <div className="flex-1 overflow-y-auto text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-6 custom-scrollbar pr-2">
                          {post.details[selectedDetailIndex].description}
                        </div>
                        {post.externalLink && (
                          <a
                            href={post.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-auto group"
                          >
                            <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
                            Kunjungi Website
                          </a>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <Info size={48} className="mb-4 opacity-20" />
                        <p className="text-sm text-center">
                          Pilih salah satu klasifikasi di samping<br />untuk melihat detailnya.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
