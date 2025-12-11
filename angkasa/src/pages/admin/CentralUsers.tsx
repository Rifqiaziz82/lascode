import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Users, GraduationCap, Building2, Search, Filter, X, Mail, Calendar, Phone, MapPin, Activity } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'Pelajar' | 'Provider';
    status: 'Aktif' | 'Non-aktif';
    joined: string;
    phone: string;
    lastLogin: string;
    bio: string;
    location: string;
}

export default function CentralUsers() {
    const [activeTab, setActiveTab] = useState<'all' | 'user' | 'provider'>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pelajar: 0,
        provider: 0
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // 1. Fetch Standard Users from Firestore
                const querySnapshot = await getDocs(collection(db, 'users'));
                const fetchedUsers: User[] = [];
                let pelajarCount = 0;
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedUsers.push({
                        id: doc.id as any,
                        name: data.name || 'No Name',
                        email: data.email || '',
                        role: 'Pelajar', // Force role for Firestore users
                        status: data.status || 'Aktif',
                        joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A',
                        phone: data.phone || '-',
                        lastLogin: data.lastLogin || '-',
                        bio: data.bio || '',
                        location: data.location || '-'
                    });
                    pelajarCount++;
                });

                // 2. Fetch Admin Providers from Realtime Database
                const { ref, get } = await import('firebase/database'); // Dynamic import to ensure rtdb is available
                const { rtdb } = await import('../../firebase');
                
                const adminRef = ref(rtdb, 'admins');
                const adminSnapshot = await get(adminRef);
                
                let providerCount = 0;

                if (adminSnapshot.exists()) {
                    adminSnapshot.forEach((childSnapshot) => {
                        const data = childSnapshot.val();
                        fetchedUsers.push({
                            id: data.uid || childSnapshot.key,
                            name: data.name || 'Admin Provider',
                            email: data.email || '',
                            role: 'Provider', // Force role for RTDB admins
                            status: 'Aktif', // Assume active if in DB
                            joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A',
                            phone: '-',
                            lastLogin: data.lastLogin ? new Date(data.lastLogin).toLocaleDateString() : '-',
                            bio: 'Admin Provider Account',
                            location: '-'
                        });
                        providerCount++;
                    });
                }

                setUsers(fetchedUsers);
                setStats({
                    total: fetchedUsers.length,
                    pelajar: pelajarCount,
                    provider: providerCount
                });
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery) ||
            user.location.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'user') return user.role === 'Pelajar' && matchesSearch;
        if (activeTab === 'provider') return user.role === 'Provider' && matchesSearch;
        return matchesSearch;
    });

    const userStats = [
        { label: 'Total Pengguna', value: stats.total.toLocaleString(), change: 'Live', icon: Users, color: 'text-purple-400' },
        { label: 'Total Pelajar', value: stats.pelajar.toLocaleString(), change: 'Live', icon: GraduationCap, color: 'text-pink-400' },
        { label: 'Admin Provider', value: stats.provider.toLocaleString(), change: 'Live', icon: Building2, color: 'text-orange-400' },
    ];

    return (
        <AdminLayout role="central">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Manajemen Pengguna</h1>
                    <p className="text-slate-400">Kelola data pengguna, pelajar, dan provider</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {userStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg bg-slate-700/50 ${stat.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className="text-sm font-medium text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full">
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Users Table Section */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700 flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-white">Daftar Pengguna</h2>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Cari pengguna..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <button className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
                                    <Filter size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-slate-700">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setActiveTab('user')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'user'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                User
                            </button>
                            <button
                                onClick={() => setActiveTab('provider')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'provider'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                Admin Provider
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-700/50 text-slate-400 text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Nama</th>
                                    <th className="px-6 py-4 font-medium">Email</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Bergabung</th>
                                    <th className="px-6 py-4 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                        <td className="px-6 py-4 text-slate-300">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`
                        px-2.5 py-1 rounded-full text-xs font-medium
                        ${user.role === 'Pelajar' ? 'bg-pink-400/10 text-pink-400' : 'bg-orange-400/10 text-orange-400'}
                      `}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                        px-2.5 py-1 rounded-full text-xs font-medium
                        ${user.status === 'Aktif' ? 'bg-green-400/10 text-green-400' : 'bg-slate-400/10 text-slate-400'}
                      `}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{user.joined}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                            <h3 className="text-xl font-bold text-white">Detail Pengguna</h3>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-4 rounded-full ${selectedUser.role === 'Pelajar' ? 'bg-pink-400/10 text-pink-400' : 'bg-orange-400/10 text-orange-400'
                                    }`}>
                                    {selectedUser.role === 'Pelajar' ? <GraduationCap size={32} /> : <Building2 size={32} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-white mb-1">{selectedUser.name}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.role === 'Pelajar' ? 'bg-pink-400/10 text-pink-400' : 'bg-orange-400/10 text-orange-400'
                                            }`}>
                                            {selectedUser.role}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.status === 'Aktif' ? 'bg-green-400/10 text-green-400' : 'bg-slate-400/10 text-slate-400'
                                            }`}>
                                            {selectedUser.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Mail size={16} />
                                        <span className="text-sm">Email</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedUser.email}</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Phone size={16} />
                                        <span className="text-sm">Telepon</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedUser.phone}</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <MapPin size={16} />
                                        <span className="text-sm">Lokasi</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedUser.location}</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Calendar size={16} />
                                        <span className="text-sm">Bergabung Sejak</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedUser.joined}</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <Activity size={16} />
                                    <span className="text-sm">Bio / Informasi Tambahan</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    {selectedUser.bio}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Tutup
                                </button>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">
                                    Edit Pengguna
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
