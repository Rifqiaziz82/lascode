import { useState } from 'react';
import { Search, Calendar, MapPin, Clock, ExternalLink, ArrowLeft, X, Check } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    category: 'Pendidikan' | 'Ekonomi' | 'Politik' | 'Forum Terbuka' | 'Lainnya';
    date: string;
    time: string;
    location: string;
    description: string;
    image?: string;
    organizer: string;
}

const mockEvents: Event[] = [
    {
        id: '1',
        title: 'Seminar Nasional Pendidikan 4.0',
        category: 'Pendidikan',
        date: '15 Desember 2024',
        time: '09:00 - 15:00',
        location: 'Zoom Meeting',
        description: 'Membahas tantangan dan peluang pendidikan di era digital bersama pakar pendidikan nasional.',
        organizer: 'Kemdikbud Ristek',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop'
    },
    {
        id: '2',
        title: 'Forum Ekonomi Kreatif Mahasiswa',
        category: 'Ekonomi',
        date: '20 Desember 2024',
        time: '13:00 - 16:00',
        location: 'Aula Universitas Indonesia',
        description: 'Diskusi panel tentang membangun startup sejak mahasiswa.',
        organizer: 'BEM UI',
        image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop'
    },
    {
        id: '3',
        title: 'Debat Terbuka: Politik Kampus',
        category: 'Politik',
        date: '10 Januari 2025',
        time: '10:00 - 12:00',
        location: 'Gedung Serbaguna UGM',
        description: 'Forum terbuka membahas dinamika politik kampus dan peran mahasiswa.',
        organizer: 'Dema UGM',
        image: 'https://images.unsplash.com/photo-1575320181282-9afab399332c?w=800&h=400&fit=crop'
    }
];

export default function EventView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const categories = ['Semua', 'Pendidikan', 'Ekonomi', 'Politik', 'Forum Terbuka', 'Lainnya'];

    const filteredEvents = mockEvents.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Semua' || event.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleShare = async () => {
        const shareData = {
            title: selectedEvent?.title,
            text: `Ikuti acara ${selectedEvent?.title} di Angkasa Forum!`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link acara berhasil disalin!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleRegistration = (e: React.FormEvent) => {
        e.preventDefault();
        setRegistrationSuccess(true);
        setTimeout(() => {
            setRegistrationSuccess(false);
            setIsRegistering(false);
        }, 2000);
    };

    if (selectedEvent) {
        return (
            <div className="space-y-6 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                {/* Registration Modal */}
                {isRegistering && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                            {registrationSuccess ? (
                                <div className="p-12 flex flex-col items-center text-center animate-in zoom-in duration-300">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                        <Check className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Pendaftaran Berhasil!</h3>
                                    <p className="text-slate-400">Terima kasih telah mendaftar di acara ini.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-white">Formulir Pendaftaran</h3>
                                        <button onClick={() => setIsRegistering(false)} className="text-slate-400 hover:text-white transition-colors">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleRegistration} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Nama Lengkap</label>
                                            <input required type="text" className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Masukkan nama lengkap" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Daftar Sebagai</label>
                                            <select required className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                                <option value="">Pilih peran...</option>
                                                <option value="Pelajar">Pelajar</option>
                                                <option value="Mahasiswa">Mahasiswa</option>
                                                <option value="Dosen">Dosen</option>
                                                <option value="Umum">Umum</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Asal Instansi</label>
                                            <input required type="text" className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Universitas / Sekolah / Perusahaan" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Nomor Telepon / WhatsApp</label>
                                            <input required type="tel" className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="08xxxxxxxxxx" />
                                        </div>
                                        <div className="pt-4">
                                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                                                Kirim Pendaftaran
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <button 
                    onClick={() => setSelectedEvent(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <div className="p-2 rounded-full bg-slate-800/50 group-hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Kembali ke Daftar Acara</span>
                </button>

                <div className="bg-slate-800/30 border border-slate-600/30 rounded-2xl overflow-hidden p-1">
                    <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
                        <img 
                            src={selectedEvent.image} 
                            alt={selectedEvent.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                            <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase tracking-wide mb-4 inline-block">
                                {selectedEvent.category}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedEvent.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm md:text-base">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <span>{selectedEvent.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <span>{selectedEvent.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-400" />
                                    <span>{selectedEvent.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: Description */}
                        <div className="md:col-span-2 flex flex-col min-h-[500px]">
                            <h3 className="text-xl font-bold text-slate-200 mb-4">Tentang Acara Ini</h3>
                            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg flex-1">
                                <p>{selectedEvent.description}</p>
                                <p className="mt-4">
                                    Bergabunglah dalam acara ini untuk mendapatkan wawasan mendalam dan berdiskusi langsung dengan para ahli di bidangnya. 
                                    Acara ini dirancang untuk memberikan kesempatan belajar dan networking yang berharga bagi seluruh peserta.
                                </p>
                                <p className="mt-4">
                                    Jangan lewatkan kesempatan ini untuk memperluas pengetahuan dan jaringan Anda.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Actions & Organizer */}
                        <div className="space-y-6">
                            {/* Actions Card */}
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30 sticky top-24">
                                <h3 className="text-lg font-bold text-white mb-6">Daftar Sekarang</h3>
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => setIsRegistering(true)}
                                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
                                    >
                                        Daftar Peserta
                                    </button>
                                    <button className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        Kunjungi Website
                                    </button>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-700/30 text-center">
                                    <button onClick={handleShare} className="w-full group">
                                        <p className="text-sm text-slate-400 mb-2 group-hover:text-blue-400 transition-colors">Bagikan acara ini</p>
                                        <div className="flex justify-center gap-4">
                                            {/* Dummy social icons simply triggering title share */}
                                            {['Twitter', 'Facebook', 'LinkedIn', 'WhatsApp'].map(social => (
                                                <div key={social} className="p-2 bg-slate-700/50 group-hover:bg-slate-700 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                                                    <div className="w-4 h-4 bg-current rounded-full"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Organizer Info (Moved here) */}
                            <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30">
                                <h4 className="text-lg font-semibold text-slate-200 mb-4">Penyelenggara</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                                        🏢
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-200">{selectedEvent.organizer}</div>
                                        <div className="text-sm text-slate-400">Verified Organizer</div>
                                    </div>
                                </div>
                                <button className="w-full mt-4 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">
                                    Lihat Profil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 mb-4">
            {/* Header & Search */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-slate-200 mb-6 text-center">Acara & Seminar</h2>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari acara..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Event List */}
            <div className="grid grid-cols-1 gap-6">
                {filteredEvents.map((event) => (
                    <div 
                        key={event.id} 
                        onClick={() => setSelectedEvent(event)}
                        className="bg-slate-800/30 border border-slate-600/30 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group cursor-pointer"
                    >
                        <div className="md:flex">
                            <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                        {event.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 md:w-2/3 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{event.date}</span>
                                        <span className="mx-1">•</span>
                                        <Clock className="w-4 h-4" />
                                        <span>{event.time}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-200 mb-2 group-hover:text-blue-400 transition-colors">{event.title}</h3>
                                    <p className="text-slate-400 mb-4 line-clamp-2">{event.description}</p>

                                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">🏢</span>
                                            <span>{event.organizer}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedEvent(event);
                                            setIsRegistering(true); // Open registration directly if clicked here
                                        }}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm"
                                    >
                                        Daftar Sekarang
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedEvent(event);
                                        }}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
