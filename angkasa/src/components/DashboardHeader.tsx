// src/components/DashboardHeader.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useEffect, useState } from "react";
import { MessageSquare, Mail, Bell, LogOut, Search } from "lucide-react";
import { searchUsers } from "../lib/userService";
import NotificationSidebar from "./NotificationSidebar";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // 🔍 Cari user di Firestore
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (err) {
      console.error("Gagal cari user:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Profile */}
            <Link to="/profile" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center border-2 border-slate-500/30 group-hover:border-slate-400 transition-colors overflow-hidden">
                  <span className="font-medium text-slate-300">{initial}</span>
                </div>
              </div>
              <span className="font-semibold text-slate-300 group-hover:text-white transition-colors hidden sm:inline">
                {user.name}
              </span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-lg hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari akun atau konten..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-slate-400 text-slate-300 placeholder-slate-400 backdrop-blur-sm"
                />

                {showSearch && (
                  <div className="absolute top-full mt-2 w-full bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 shadow-lg overflow-hidden z-50 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-3 text-center text-slate-400 text-sm">Mencari...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleUserClick(result.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-slate-300">
                              {result.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-slate-200 text-sm">{result.name}</p>
                            <p className="text-xs text-slate-400 truncate">{result.email}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-slate-500 text-sm">Tidak ada hasil</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center gap-3">
              <Link to="/Forum" className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors" title="Forum">
                <MessageSquare className="w-5 h-5" />
              </Link>
              <Link to="/email" className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors" title="Email">
                <Mail className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowNotifications(true)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors relative"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <NotificationSidebar isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}