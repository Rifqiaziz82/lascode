// src/pages/PublicProfile.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
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
  social_media?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [productions, setProductions] = useState<Certificate[]>([]);
  const [koleksi, setkoleksi] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

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
    <div className="min-h-screen bg-slate-900 text-slate-200 pb-20">
      <div className="container mx-auto px-4 sm:px-6 pt-8 max-w-6xl">
        {/* Header Profil */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <p className="text-slate-500 text-sm">View all your profile details here.</p>
        </div>

        {/* Main Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column: Avatar & Name */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-500 mb-4 shadow-inner">
                <span className="text-6xl font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-3xl font-bold mt-2">{name}</h2>
              <p className="text-green-400 text-sm mt-1">Premium User</p>
            </div>
          </div>

          {/* Right Column: Bio & Details */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bio & other details</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
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
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Social Media</h3>
          <div className="flex gap-4">
            {social_media.instagram && (
              <a
                href={`https://instagram.com/${social_media.instagram.trim()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 transition-all transform hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {social_media.youtube && (
              <a
                href={`https://youtube.com/${social_media.youtube.trim()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 transition-all transform hover:scale-110"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
            {social_media.tiktok && (
              <a
                href={`https://tiktok.com/@${social_media.tiktok.trim()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 transition-all transform hover:scale-110"
              >
                <Twitch className="w-5 h-5" />
              </a>
            )}
            {!social_media.instagram && !social_media.youtube && !social_media.tiktok && (
              <span className="text-slate-500 text-sm">No social media linked</span>
            )}
          </div>
        </div>
        {/* My Collection */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
          <h3 className="text-lg font-semibold mb-4">My Collection</h3>
          {collection.length > 0 ? (
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
  );
}