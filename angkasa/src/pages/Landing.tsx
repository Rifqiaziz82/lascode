
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import LandingHeader from '../components/LandingHeader';
import LandingFooter from '../components/LandingFooter';
import Particles from '../components/Particles';
import { useAuth } from '../components/AuthProvider';
import CountUpStat from '../components/CountUpStat';
import { Play, ArrowRight, Star, Award, Users, Zap } from 'lucide-react';
import { useRef } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAudioPlaying, isEmailVerified, togglePlay } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  console.log('Email verified:', isEmailVerified);

  const handleMulaiSekarang = () => {
    if (user) {
      navigate('/forum');
    } else {
      navigate('/login');
    }
  };

  const handleScrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { value: 10, suffix: "K+", label: "Pengguna Aktif", icon: Users },
    { value: 500, suffix: "+", label: "Lomba Terdaftar", icon: Award },
    { value: 95, suffix: "%", label: "Tingkat Kepuasan", icon: Star },
    { value: 24, suffix: "/7", label: "Dukungan Platform", icon: Zap },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden selection:bg-primary/30 selection:text-white font-sans">
      <LandingHeader />
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-black" />
        <Particles
          particleCount={400}
          particleSpread={15}
          speed={0.3}
          particleColors={['#60A5FA', '#818CF8', '#C084FC', '#ffffff']}
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          particleBaseSize={120}
          sizeRandomness={0.8}
          cameraDistance={25}
          className="absolute inset-0 opacity-60"
        />
      </div>

      {/* Floating Audio Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={togglePlay}
          className="group flex items-center justify-center w-12 h-12 bg-slate-800/80 hover:bg-primary/90 backdrop-blur-md border border-slate-700/50 rounded-full shadow-lg hover:shadow-primary/50 transition-all duration-500 ease-out"
          title={isAudioPlaying ? 'Jeda musik latar' : 'Putar musik latar'}
          aria-label="Putar musik latar"
        >
          {isAudioPlaying ? (
            <div className="flex gap-1 items-center h-4">
              <span className="w-1 h-full bg-white animate-pulse" style={{ animationDelay: '0s' }} />
              <span className="w-1 h-3/4 bg-white animate-pulse" style={{ animationDelay: '0.1s' }} />
              <span className="w-1 h-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
            </div>
          ) : (
            <Play className="w-5 h-5 text-white ml-1 fill-current" />
          )}
        </button>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative z-10 min-h-screen flex flex-col justify-center items-center pt-20 px-4">
        <motion.div 
          style={{ y, opacity }} 
          className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
        >
          <div className="text-left space-y-8 pl-4 lg:pl-0">
            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-primary-foreground font-medium text-sm mb-2 animate-fade-in-up">
              🚀 Platform #1 Untuk Pelajar Indonesia
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Raih Masa Depan <br />
              <span className="bg-gradient-to-r from-slate-400 via-blue-400 to-blue-400 bg-clip-text text-transparent">
                Bersama Angkasa
              </span>
            </h1>

            <div className="text-xl md:text-2xl text-slate-400 max-w-xl leading-relaxed">
              Jelajahi ribuan <span className="text-white font-semibold">lomba</span>, <span className="text-white font-semibold">beasiswa</span>, dan peluang emas lainnya. Mulai perjalanan suksesmu hari ini.
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <button
                onClick={handleMulaiSekarang}
                className="group relative px-8 py-4 bg-white text-slate-900 font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <span className="flex items-center gap-2">
                  Mulai Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button
                onClick={handleScrollToAbout}
                className="px-8 py-4 bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          <div className="hidden lg:block relative">
             {/* Decorative Abstract Shapes */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
             <div className="relative z-10 bg-slate-900/30 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Trending Topik</h3>
                    <p className="text-slate-400">Peluang terpanas minggu ini</p>
                  </div>
               </div>
               <div className="space-y-4">
                 {[
                   { title: "Lomba UI/UX Design Nasional", tags: ["Design", "Teknologi"], color: "bg-pink-500" },
                   { title: "Beasiswa S2 ke Jepang Full", tags: ["Pendidikan", "Internasional"], color: "bg-blue-500" },
                   { title: "Hackathon FinTech 2024", tags: ["Coding", "Finance"], color: "bg-green-500" }
                 ].map((item, i) => (
                   <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-white/5 hover:bg-slate-800/80 transition-colors flex items-center gap-4 group cursor-pointer">
                      <div className={`w-12 h-12 ${item.color}/20 rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform`}>
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                        <div className="flex gap-2 mt-1">
                          {item.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">{tag}</span>
                          ))}
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </motion.div>
      </section>
      
      {/* Stats Section */}
      <section className="relative z-10 py-10 border-y border-white/5 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
           {stats.map((stat, i) => (
             <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
             >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <h3 className="text-3xl font-bold text-white mb-1">
                  <CountUpStat value={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="text-slate-400 text-sm">{stat.label}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white inline-block bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
              Kenapa Memilih Angkasa?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Platform all-in-one yang mengerti kebutuhan pengembangan dirimu.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: '🏆',
                title: 'Kurasi Terbaik',
                desc: 'Setiap lomba dan beasiswa melalui proses verifikasi ketat untuk memastikan validitasnya.',
                gradient: 'from-slate-400/20 to-blue-500/20'
              },
              {
                icon: '🎯',
                title: 'Rekomendasi Pintar',
                desc: 'Sistem kami mempelajari minatmu dan memberikan rekomendasi peluang yang paling relevan.',
                gradient: 'from-slate-400/20 to-blue-500/20'
              },
              {
                icon: '👥',
                title: 'Komunitas Suportif',
                desc: 'Diskusi, cari tim, dan dapatkan mentor dari komunitas yang memiliki visi sama.',
                gradient: 'from-slate-400/20 to-blue-500/20'
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="group relative p-1 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 hover:from-blue-500/50 hover:to-slate-500/50 transition-all duration-500"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              >
                <div className="h-full bg-slate-900/90 backdrop-blur-xl p-8 rounded-xl relative overflow-hidden">
                   <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} blur-[50px] rounded-full -mr-16 -mt-16 transition-opacity group-hover:opacity-100`} />
                   
                   <div className="relative z-10">
                    <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                    <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors">{item.title}</h3>
                    <p className="text-slate-400 group-hover:text-slate-300 leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles Section / Features */}
      <section id="prinsip" className="py-32 px-6 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px]" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white leading-tight">
                Prinsip Kami Dalam <br />
                <span className="text-blue-400">Membangun Masa Depan</span>
              </h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                Kami tidak hanya sekedar platform info, kami membangun ekosistem di mana integritas, inovasi, dan kolaborasi menjadi fondasi utamanya.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: '🛡️', title: 'Integritas', desc: 'Validitas informasi adalah prioritas utama kami.' },
                  { icon: '🚀', title: 'Inovasi', desc: 'Teknologi terkini untuk kemudahan akses.' },
                  { icon: '🤝', title: 'Kolaborasi', desc: 'Saling mendukung untuk tumbuh bersama.' },
                  { icon: '💡', title: 'Pemberdayaan', desc: 'Mencetak pemimpin masa depan.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex flex-shrink-0 items-center justify-center text-xl border border-slate-700">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                 <motion.div 
                   animate={{ y: [0, -20, 0] }} 
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                   className="space-y-4 mt-12"
                 >
                   <div className="h-64 rounded-2xl bg-gradient-to-b from-blue-500/20 to-slate-900 border border-white/10 p-6 flex flex-col justify-end">
                      <span className="text-4xl font-bold text-white mb-2">100+</span>
                      <span className="text-slate-400 text-sm">Mitra Universitas</span>
                   </div>
                   <div className="h-40 rounded-2xl bg-slate-800/50 border border-white/5 p-6">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 mb-4" />
                      <div className="h-2 w-20 bg-slate-700 rounded mb-2" />
                      <div className="h-2 w-12 bg-slate-700 rounded" />
                   </div>
                 </motion.div>
                 
                 <motion.div 
                   animate={{ y: [0, 20, 0] }} 
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                   className="space-y-4"
                 >
                   <div className="h-40 rounded-2xl bg-slate-800/50 border border-white/5 p-6">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 mb-4" />
                      <div className="h-2 w-20 bg-slate-700 rounded mb-2" />
                      <div className="h-2 w-12 bg-slate-700 rounded" />
                   </div>
                   <div className="h-64 rounded-2xl bg-gradient-to-t from-blue-500/20 to-slate-900 border border-white/10 p-6 flex flex-col justify-end">
                      <span className="text-4xl font-bold text-white mb-2">Rp 50 Juta</span>
                      <span className="text-slate-400 text-sm">Total Hadiah Beasiswa</span>
                   </div>
                 </motion.div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Hubungi Kami
            </h2>
            <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">
              Ada pertanyaan? Tim kami siap membantu Anda 24/7
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {/* Email Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-left shadow-xl hover:shadow-blue-500/20 transition-all"
              >
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                <a href="mailto:angkasaid@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                  angkasaid@gmail.com
                </a>
                <p className="text-slate-500 text-sm mt-2">Respon dalam 24 jam</p>
              </motion.div>

              {/* Phone/WhatsApp Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-left shadow-xl hover:shadow-green-500/20 transition-all"
              >
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Admin WhatsApp</h3>
                <a href="https://wa.me/6287865440787" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                  +62 878-6544-0787
                </a>
                <p className="text-slate-500 text-sm mt-2">Chat langsung dengan admin</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-500/20 to-slate-600/20 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Siap Memulai Perjalananmu?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pelajar berprestasi lainnya dan temukan opportunitas yang akan mengubah hidupmu.
            </p>
            <button
              onClick={handleMulaiSekarang}
              className="px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
            >
              Daftar Sekarang - Gratis
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
