import {
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Platform",
      links: ["Tentang Kami", "Fitur", "Karir", "Blog"],
    },
    {
      title: "Dukungan",
      links: [
        "Pusat Bantuan",
        "Syarat & Ketentuan",
        "Kebijakan Privasi",
        "Kontak",
      ],
    },
    {
      title: "Komunitas",
      links: ["Event","Newsletter"],
    },
  ];

  return (
    <footer className="relative z-10 bg-slate-900 border-t border-slate-800 text-slate-300 pt-16 pb-8 overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & Description */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Angkasa
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Platform terdepan untuk menghubungkan talenta muda dengan peluang
              emas. Temukan lomba, beasiswa, dan komunitas yang mendukung
              perjalanan suksesmu.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[Github, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 group"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section, idx) => (
              <div key={idx}>
                <h4 className="font-bold text-white mb-6 text-lg tracking-wide">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href="#"
                        className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Copyright */}
        <div className="border-t border-slate-800 pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 text-sm text-slate-500">
              <div className="flex items-center gap-2 hover:text-slate-300 transition-colors">
                <Mail className="w-4 h-4" />
                <span>angkasaid@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 hover:text-slate-300 transition-colors">
                <MapPin className="w-4 h-4" />
                <span>Malang, Jawa Timur</span>
              </div>
            </div>
            <div className="text-center md:text-right text-sm text-slate-500">
              <p>&copy; {currentYear} Angkasa Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
