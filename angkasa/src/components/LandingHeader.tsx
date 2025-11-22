// src/components/LandingHeader.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Rocket, Menu, X } from "lucide-react";
import { useAuth } from "./AuthProvider";

const LandingHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Deteksi scroll untuk efek header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoToForum = () => {
    if (user) {
      navigate("/forum");
    } else {
      navigate("/login");
    }
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleNavigation = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/70 backdrop-blur-md border-b border-slate-700/40' 
          : 'bg-slate-900/30 backdrop-blur-sm border-b border-slate-600/20'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
            onClick={() => isMenuOpen && setIsMenuOpen(false)}
          >
            <div className="p-2 rounded-lg bg-slate-700/30 group-hover:bg-slate-600/40 transition-colors">
              <Rocket className="w-5 h-5 text-slate-300" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent">
              Angkasa
            </span>
          </Link>

          {/* Desktop Nav — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigation('home')}
              className="text-slate-300 hover:text-white transition-colors font-medium relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-400 group-hover:w-full transition-all"></span>
            </button>
            <button
              onClick={() => handleNavigation('about')}
              className="text-slate-300 hover:text-white transition-colors font-medium relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-400 group-hover:w-full transition-all"></span>
            </button>
            <button
              onClick={() => handleNavigation('contact')}
              className="text-slate-300 hover:text-white transition-colors font-medium relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-400 group-hover:w-full transition-all"></span>
            </button>

            {user ? (
              <button
                onClick={handleGoToForum}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-md transition-colors shadow-md hover:shadow-lg"
              >
                Masuk
              </button>
            ) : (
              <Link to="/login">
                <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-md transition-colors shadow-md hover:shadow-lg">
                  Login
                </button>
              </Link>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown — muncul saat toggle */}
        {isMenuOpen && (
          <div 
            className="md:hidden mt-4 rounded-xl overflow-hidden bg-slate-800/60 backdrop-blur-md border border-slate-600/40 shadow-xl animate-fade-in"
            role="menu"
          >
            <div className="p-4 space-y-2">
              <button
                onClick={() => handleNavigation('home')}
                className="w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-lg transition-colors font-medium"
                role="menuitem"
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('about')}
                className="w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-lg transition-colors font-medium"
                role="menuitem"
              >
                About
              </button>
              <button
                onClick={() => handleNavigation('contact')}
                className="w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-lg transition-colors font-medium"
                role="menuitem"
              >
                Contact
              </button>
              <div className="border-t border-slate-700/50 pt-3 mt-1">
                {user ? (
                  <button
                    onClick={handleGoToForum}
                    className="w-full text-center px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors shadow-md"
                  >
                    Masuk
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    className="block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <button className="w-full text-center px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors shadow-md">
                      Login
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingHeader;