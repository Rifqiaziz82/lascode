// src/pages/PublicProfile.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../components/AuthProvider"; 
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  FileText,
  CheckCircle,
  Sparkles,
  Lock,
  X,
  ChevronRight,
  Music,
  Headphones,
  Instagram,
  Youtube,
  Twitch,
  Heart,
  Share2,
  MessageSquare,
  Play,
} from "lucide-react";
import Particles from '../components/Particles';

interface Certificate {
  id: string;
  title: string;
  competition_name: string;
  verified: boolean;
  image_url?: string;
  timing?: string;
  listens?: number;
}

interface User {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  role?: string;
  experience_level?: string;
  favorite_artists?: string[];
  favorite_genre?: string;
  software_used?: string;
  city_region?: string;
  availability?: string;
  badges?: string[];
  tags?: string[];
  banner_photo?: string;
  profile_photo?: string;
  social_media?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [productions, setProductions] = useState<Certificate[]>([]);
  const [koleksi, setkoleksi] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isFriend, setIsFriend] = useState(false); // ✅
  const [loadingFriend, setLoadingFriend] = useState(true); // ✅


  useEffect(() => {
    if (!id) {
      navigate("/forum");
      return;
    }

    const loadProfile = async () => {
      try {
        // 1. Muat data user
        const userDoc = await getDoc(doc(db, "users", id));
        if (!userDoc.exists()) {
          navigate("/forum");
          return;
        }

        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        setUser(userData);

        // 2. Muat produksi & koleksi dari koleksi 'certificates'
        const certQuery = query(
          collection(db, "certificates"),
          where("user_id", "==", id),
          where("public", "==", true)
        );
        const certSnapshot = await getDocs(certQuery);
        const certs = certSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Certificate[];

        // Misal: semua sertifikat = productions, atau pisahkan berdasarkan field (optional)
        setProductions(certs);
        setkoleksi(certs); // atau filter jika ada field 'type'
      } catch (err) {
        console.error("Gagal memuat profil:", err);
        navigate("/forum");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, navigate]);

  useEffect(() => {
    if (!currentUser || !user) {
      setIsFriend(false);
      setLoadingFriend(false);
      return;
    }

    const checkFriendship = async () => {
      try {
        const friendDoc = await getDoc(doc(db, "friends", currentUser.id));
        if (friendDoc.exists()) {
          const data = friendDoc.data();
          setIsFriend(Array.isArray(data.friends) && data.friends.includes(user.id));
        } else {
          setIsFriend(false);
        }
      } catch (err) {
        console.error("Gagal cek pertemanan:", err);
        setIsFriend(false);
      } finally {
        setLoadingFriend(false);
      }
    };

    checkFriendship();
  }, [currentUser, user]);

    // ✅ Fungsi tambah teman
  const addFriend = async () => {
    if (!currentUser || !user) return;

    try {
      await setDoc(
        doc(db, "friends", currentUser.id),
        {
          friends: arrayUnion(user.id),
        },
        { merge: true }
      );
      setIsFriend(true);
    } catch (err) {
      console.error("Gagal menambah teman:", err);
      alert("Gagal menambah teman. Coba lagi.");
    }
  };
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const {
    name,
    bio = "",
    role = "",
    experience_level = "",
    favorite_artists = [],
    favorite_genre = "",
    software_used = "",
    city_region = "",
    availability = "",
    badges = [],
    tags = [],
    social_media = {},
  } = user;

  // Helper: tampilkan "–" jika kosong
  const display = (value: string | null | undefined) => value || "–";

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 pb-20 overflow-x-hidden">
      {/* Background Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
        <Particles 
          particleCount={60} 
          particleSpread={10} 
          speed={0.1} 
          particleColors={['#60a5fa', '#a78bfa']}
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          particleBaseSize={100}
          sizeRandomness={1}
          cameraDistance={20}
          disableRotation={false}
        />
      </div>

      <div className="relative z-10">
      {/* Banner/Header */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-900 via-purple-900 to-slate-900 overflow-hidden">
        {user.banner_photo ? (
          <img 
            src={user.banner_photo} 
            alt="Banner" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl -mt-24">
        {/* Main Profile Card - Overlapping Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column: Avatar & Name */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full bg-slate-800 p-1 border-4 border-slate-800 shadow-xl overflow-hidden mb-4">
                {user.profile_photo ? (
                  <img 
                    src={user.profile_photo} 
                    alt={name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mt-2 text-center">{name}</h2>
              <div className="flex items-center gap-2 text-slate-400 mt-2">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                  {display(role)}
                </span>
                <span className="text-sm">• {display(city_region)}</span>
              </div>

              {/* Add Friend Button */}
              {currentUser && currentUser.id !== user.id && (
                <div className="mt-6 w-full">
                  {loadingFriend ? (
                    <button disabled className="w-full py-2.5 px-4 bg-slate-700/50 text-white rounded-xl cursor-not-allowed text-sm font-medium">
                      Loading...
                    </button>
                  ) : isFriend ? (
                    <button disabled className="w-full py-2.5 px-4 bg-green-600/20 text-green-400 border border-green-500/30 rounded-xl cursor-default text-sm font-medium">
                      ✓ Sudah Berteman
                    </button>
                  ) : (
                    <button
                      onClick={addFriend}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 text-sm font-medium"
                    >
                      + Tambah Teman
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Bio & Details */}
          <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Bio & Detail Profil</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">Online</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-3">
                  <p className="text-xs text-slate-400">My Role</p>
                  <p className="font-medium text-white">{display(role)}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-400">My 3 Favorite Artists</p>
                  <p className="font-medium text-white">{favorite_artists.length ? favorite_artists.join(", ") : "–"}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-400">The Software or Equipment I Use</p>
                  <p className="font-medium text-white">{display(software_used)}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-400">My City or Region</p>
                  <p className="font-medium text-white">{display(city_region)}</p>
                </div>
              </div>

              <div>
                <div className="mb-3">
                  <p className="text-xs text-slate-400">My Experience Level</p>
                  <p className="font-medium text-white">{display(experience_level)}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-400">My Favorite Music Genre</p>
                  <p className="font-medium text-white">{display(favorite_genre)}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-400">My Preferred Music Mood</p>
                  <p className="font-medium text-white">–</p> {/* opsional: simpan di database */}
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-400">Availability</p>
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-600 text-white">
                    {display(availability)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div>
                <p className="text-xs text-slate-400">Badges</p>
                <div className="flex gap-2 mt-1">
                  {badges.length > 0 ? (
                    badges.map((badge, idx) => (
                      <span key={idx} className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                        {badge}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">None</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400">Tags</p>
                <div className="flex gap-2 mt-1">
                  {tags.length > 0 ? (
                    tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 mb-8 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-white">Social Media</h3>
          <div className="flex gap-4">
            {social_media.instagram && (
              <a
                href={`https://instagram.com/${social_media.instagram.trim()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl hover:bg-pink-500/30 transition-all transform hover:scale-110"
              >
                <Instagram className="w-5 h-5 text-pink-400" />
              </a>
            )}
            {social_media.youtube && (
              <a
                href={`https://youtube.com/${social_media.youtube.trim()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all transform hover:scale-110"
              >
                <Youtube className="w-5 h-5 text-red-400" />
              </a>
            )}
            {social_media.tiktok && (
              <a
                href={`https://tiktok.com/@${social_media.tiktok.trim()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-all transform hover:scale-110"
              >
                <Twitch className="w-5 h-5 text-cyan-400" />
              </a>
            )}
            {!social_media.instagram && !social_media.youtube && !social_media.tiktok && (
              <span className="text-slate-500 text-sm">Belum ada social media</span>
            )}
          </div>
        </div>

        {/* My Collection */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-white">Koleksi Sertifikat</h3>
          {koleksi.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {koleksi.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative group cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => setSelectedCertificate(item)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-700 border border-slate-600">
                    <img
                      src={item.image_url || `https://via.placeholder.com/300?text=Track+${idx + 1}`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium text-sm text-white line-clamp-1">{item.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">by {name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-8 text-slate-500">
              No items in collection yet.
            </div>
          )}
        </div>
      </div>

      {/* Modal Gambar Sertifikat / Produksi */}
      {selectedCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedCertificate(null)}
        >
          <div
            className="relative bg-slate-800 rounded-xl max-w-3xl w-full p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 p-2 bg-slate-700/50 hover:bg-slate-600 rounded-full text-white z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedCertificate.image_url || "https://via.placeholder.com/600x400?text=No+Image"}
              alt={selectedCertificate.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-bold text-white">{selectedCertificate.title}</h3>
              <p className="text-slate-400">
                {selectedCertificate.competition_name || selectedCertificate.timing || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}