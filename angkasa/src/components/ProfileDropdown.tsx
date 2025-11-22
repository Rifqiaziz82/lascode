import React, { useState, useRef, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  avatar?: string; // Opsional, jika tidak ada avatar
}

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Contoh data pengguna
  const user: User | null = {
    name: "Budi Santoso",
    email: "budi@example.com",
    avatar: "https://png.pngtree.com/thumb_back/fw800/background/20230610/pngtree-man-wearing-glasses-and-a-suit-smiles-for-the-camera-image_2904370.jpg"
  };

  // Fungsi untuk menutup dropdown jika klik di luar elemen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fungsi aksi
  const handleProfileClick = () => {
    console.log("Lihat Profil");
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    console.log("Pengaturan");
    setIsOpen(false);
  };

  const handleLogout = () => {
    console.log("Logout");
    setIsOpen(false);
    // Tambahkan logika logout di sini
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Profil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <img
          className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-400 transition-colors duration-200"
          src={user?.avatar || "https://via.placeholder.com/40x40/cccccc/666666?text=U"}
          alt="User avatar"
        />
        <h1 className="font-bold text-gray-800 hidden md:block">
          {user ? user.name : "Nama Pengguna"}
        </h1>
      </button>

      {/* Dropdown Profil */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Profil Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={user?.avatar || "https://via.placeholder.com/40x40/cccccc/666666?text=U"}
              alt="User avatar"
            />
            <div>
              <p className="font-semibold text-gray-800 truncate max-w-[140px]">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate max-w-[140px]">{user?.email}</p>
            </div>
          </div>

          {/* Menu Aksi */}
          <div>
            <button
              onClick={handleProfileClick}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Lihat Profil
            </button>
            <button
              onClick={handleSettingsClick}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Pengaturan
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;