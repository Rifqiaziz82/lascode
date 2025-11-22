
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingHeader from '../components/LandingHeader';
import RotatingText from '../components/RotatingText';
import { useAuth } from '../components/AuthProvider';
import { Play, Pause } from 'lucide-react'; 

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAudioPlaying, isEmailVerified, togglePlay } = useAuth(); 

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <LandingHeader />
      <div className="fixed bottom-6 left-6 z-20">
        <button
          onClick={togglePlay}
          className="group flex items-center gap-2 px-4 py-2.5 bg-slate-800/70 hover:bg-slate-700/80 backdrop-blur-md border border-slate-600/40 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-slate-300 hover:text-white"
          title={isAudioPlaying ? 'Jeda musik latar' : 'Putar musik latar'}
          aria-label="Putar musik latar"
        >
          {isAudioPlaying ? (
            <Pause className="w-5 h-5 transition-transform group-hover:scale-110" />
          ) : (
            <Play className="w-5 h-5 transition-transform group-hover:scale-110 ml-0.5" />
          )}
          <span className="text-sm font-medium whitespace-nowrap">
            {isAudioPlaying ? 'Jeda' : 'Putar'}
          </span>
        </button>
      </div>

  
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-4 pt-20">
        <div className="max-w-4xl">
          <div className="flex flex-wrap justify-center items-end gap-3 mb-6">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg whitespace-nowrap">
              Selamat Datang di
            </h1>
            <div className="inline-flex">
              <RotatingText
                texts={['Angkasa', 'Platform Impianmu', 'Masa Depan']}
                mainClassName="px-3 sm:px-4 md:px-5 bg-slate-700 backdrop-blur-sm text-white font-bold text-3xl md:text-5xl lg:text-6xl font-bold rounded-lg shadow-lg"
                staggerFrom="last"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            </div>
          </div>

          <div className="mb-10 animate-fade-in-up">
            <p className="text-lg md:text-2xl text-slate-300 max-w-4xl mx-auto">
              Platform terpercaya untuk menemukan lomba dan beasiswa impian Anda. 
              Mulai perjalanan menuju kesuksesan bersama Angkasa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button
              onClick={handleMulaiSekarang}
              className="px-6 py-3 bg-primary hover:bg-slate-800 text-primary-foreground font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-primary/30 min-w-[180px]"
            >
              Mulai Sekarang
            </button>
            <button
              onClick={handleScrollToAbout}
              className="px-6 py-3 bg-transparent border border-slate-500 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-lg transition-all duration-300 min-w-[180px]"
            >
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </div>

      <section id="about" className="relative z-10 py-20 px-6 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Tentang Angkasa
            </h2>
            <p className="text-lg md:text-2xl text-slate-400 max-w-4xl mx-auto">
              Angkasa adalah platform inovatif yang menghubungkan talenta muda dengan peluang lomba dan beasiswa terbaik di Indonesia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏆',
                title: 'Lomba Berkualitas',
                desc: 'Temukan berbagai lomba dari tingkat lokal hingga internasional yang sesuai dengan minat Anda.',
              },
              {
                icon: '🎯',
                title: 'Beasiswa Terpercaya',
                desc: 'Akses informasi beasiswa dari berbagai institusi ternama untuk mendukung pendidikan Anda.',
              },
              {
                icon: '👥',
                title: 'Komunitas Aktif',
                desc: 'Bergabung dengan ribuan pengguna lain untuk berbagi pengalaman dan tips sukses.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass p-6 rounded-xl border border-secondary/20 hover:border-secondary/40 transition-all bg-slate-800/30 backdrop-blur-sm shadow-xl"
                initial={{ y: 0 }}
                animate={{ y: [-8, 8, -8] }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatType: 'loop',
                }}
                whileHover={{
                  y: -6,
                  scale: 1.03,
                  boxShadow: '0 16px 32px -8px rgba(0,0,0,0.3)',
                  transition: { duration: 0.3 },
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-primary text-xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="prinsip" className="py-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 mt-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Prinsip Angkasa
            </h2>
            <p className="text-lg md:text-2xl text-slate-400 max-w-4xl mx-auto">
              Angkasa berfokus untuk meningkatkan pendidikan dan menjadi perantara terbaik beasiswa & lomba bagi Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: '🎯', title: 'Integritas', desc: 'Kami berkomitmen menyediakan informasi lomba dan beasiswa yang valid dan terpercaya untuk semua pengguna.' },
              { icon: '🚀', title: 'Inovasi', desc: 'Terus berinovasi dalam memberikan pengalaman terbaik dan fitur-fitur yang memudahkan pengguna.' },
              { icon: '🤝', title: 'Kolaborasi', desc: 'Membangun ekosistem yang mendorong kolaborasi dan saling mendukung antar pengguna.' },
              { icon: '💡', title: 'Pemberdayaan', desc: 'Memberdayakan talenta muda Indonesia untuk meraih prestasi dan kesempatan pendidikan terbaik.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass p-8 rounded-xl border border-secondary/20 hover:border-secondary/40 transition-all bg-slate-800/30 backdrop-blur-sm shadow-xl"
                initial={{ y: 0 }}
                animate={{ y: [-6, 6, -6] }}
                transition={{
                  duration: 3.8 + i * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatType: 'loop',
                }}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  boxShadow: '0 12px 24px -6px rgba(0,0,0,0.25)',
                  transition: { duration: 0.3 },
                }}
              >
                <h3 className="text-2xl font-bold text-secondary mb-3">{item.icon} {item.title}</h3>
                <p className="text-slate-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}