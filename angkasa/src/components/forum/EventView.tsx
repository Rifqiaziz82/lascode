import { useState } from 'react';
import { Search, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';

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

    const categories = ['Semua', 'Pendidikan', 'Ekonomi', 'Politik', 'Forum Terbuka', 'Lainnya'];

    const filteredEvents = mockEvents.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Semua' || event.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-slate-200 mb-6">Acara & Seminar</h2>

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
                    <div key={event.id} className="bg-slate-800/30 border border-slate-600/30 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group">
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
                                    <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm">
                                        Daftar Sekarang
                                    </button>
                                    <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors text-sm flex items-center gap-2">
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
