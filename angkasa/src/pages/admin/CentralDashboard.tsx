import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    TrendingUp,
    Server,
    Activity,
    Globe,
    Cpu,
    HardDrive
} from 'lucide-react';
import { doc, onSnapshot, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useMaintenance } from '../../config/maintenance';

export default function CentralDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
    });
    
    // Settings State
    const { config: maintenance, toggleMaintenance } = useMaintenance();

    const [registration, setRegistration] = useState({
        allowRegistration: true,
        maxUsers: 1000
    });

    const [serverData, setServerData] = useState({
        cpu: '24%',
        memory: '4.2GB',
        storage: '45%'
    });

    useEffect(() => {
        // 1. Fetch Stats
        const fetchStats = async () => {
            try {
                // Total Users
                const usersSnap = await getDocs(collection(db, 'users'));
                const total = usersSnap.size;

                // Active Users (Mock logic: users who logged in today? 
                // Or just random for demo since we don't track realtime presence strictly yet)
                // For now, let's just count total users as a base.
                // In a real app we'd query 'lastLogin' > 15 mins ago.
                
                setStats({
                    totalUsers: total,
                    activeUsers: Math.floor(Math.random() * (total / 5)) // Mock active users
                });
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };

        fetchStats();

        // 2. Subscribe to Maintenance Settings - REPLACED BY HOOK
        // const unsubMaintenance = ...

        // 3. Subscribe to Registration Settings
        const unsubRegistration = onSnapshot(doc(db, 'settings', 'registration'), (docSnap) => {
            if (docSnap.exists()) {
                setRegistration(docSnap.data() as any);
            } else {
                setDoc(doc(db, 'settings', 'registration'), {
                    allowRegistration: true,
                    maxUsers: 1000
                });
            }
        });

        // 4. Subscribe to Server Status
        const unsubServer = onSnapshot(doc(db, 'status', 'server'), (docSnap) => {
            if (docSnap.exists()) {
                setServerData(docSnap.data() as any);
            } else {
                // Initialize default if missing
                const defaultServer = {
                    cpu: '15%',
                    memory: '2.4GB',
                    storage: '40%'
                };
                setDoc(doc(db, 'status', 'server'), defaultServer);
                setServerData(defaultServer);
            }
        });

        setLoading(false);

        return () => {
            // unsubMaintenance();
            unsubRegistration();
            unsubServer();
        };
    }, []);

    const toggleRegistration = async () => {
        try {
            await updateDoc(doc(db, 'settings', 'registration'), {
                allowRegistration: !registration.allowRegistration
            });
        } catch (err) {
            console.error("Failed to update registration:", err);
        }
    };

    const performanceStats = [
        { label: 'Total Pengunjung', value: stats.totalUsers.toLocaleString(), change: '+12% (30d)', icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Pengunjung Aktif', value: stats.activeUsers.toLocaleString(), change: 'Live', icon: Globe, color: 'text-blue-400' },
        { label: 'Response Time', value: '45ms', change: '-5ms', icon: Activity, color: 'text-purple-400' },
    ];

    const serverStats = [
        { label: 'CPU Usage', value: serverData.cpu, status: 'Normal', icon: Cpu, color: 'text-orange-400' },
        { label: 'Memory Usage', value: serverData.memory, status: 'Stable', icon: HardDrive, color: 'text-pink-400' },
        { label: 'Storage', value: serverData.storage, status: 'Healthy', icon: Server, color: 'text-cyan-400' },
    ];

    if (loading) return <div className="p-8 text-white">Loading Stats...</div>;

    return (
        <AdminLayout role="central">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Performa & Pengaturan</h1>
                    <p className="text-slate-400">Statistik performa website dan status server</p>
                </div>

                {/* Website Performance */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">Statistik Website</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {performanceStats.map((stat, index) => {
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
                </div>

                {/* Server Status */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">Status Server</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {serverStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-lg bg-slate-700/50 ${stat.color}`}>
                                            <Icon size={24} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-full">
                                            {stat.status}
                                        </span>
                                    </div>
                                    <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>

                                    {/* Progress Bar */}
                                    <div className="mt-4 w-full bg-slate-700 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full ${stat.color.replace('text-', 'bg-')}`}
                                            style={{ width: stat.value.includes('%') ? stat.value : '32%' }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Settings Section */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Pengaturan Umum</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {/* Maintenance Toggles */}
                            <div className="space-y-3">
                                <h3 className="text-slate-300 font-semibold mb-2">Maintenance Mode</h3>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                                    <div>
                                        <h3 className="text-white font-medium">User Maintenance</h3>
                                        <p className="text-sm text-slate-400">Tutup akses pengguna umum</p>
                                    </div>
                                    <button 
                                        onClick={() => toggleMaintenance('user')}
                                        className={`w-11 h-6 rounded-full relative transition-colors ${maintenance.user ? 'bg-blue-600' : 'bg-slate-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${maintenance.user ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                                    <div>
                                        <h3 className="text-white font-medium">DashAdmin Maintenance</h3>
                                        <p className="text-sm text-slate-400">Tutup panel DashAdmin</p>
                                    </div>
                                    <button 
                                        onClick={() => toggleMaintenance('dashAdmin')}
                                        className={`w-11 h-6 rounded-full relative transition-colors ${maintenance.dashAdmin ? 'bg-blue-600' : 'bg-slate-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${maintenance.dashAdmin ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                                    <div>
                                        <h3 className="text-white font-medium">Admin Central Maintenance</h3>
                                        <p className="text-sm text-slate-400">Tutup panel ini (Admin Central)</p>
                                    </div>
                                    <button 
                                        onClick={() => toggleMaintenance('adminCentral')}
                                        className={`w-11 h-6 rounded-full relative transition-colors ${maintenance.adminCentral ? 'bg-blue-600' : 'bg-slate-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${maintenance.adminCentral ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>

                            {/* Registration Settings */}
                            <div className="mt-8 pt-6 border-t border-slate-700">
                                <h3 className="text-slate-300 font-semibold mb-2">Pendaftaran</h3>
                                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                                    <div>
                                        <h3 className="text-white font-medium">Registrasi Pengguna</h3>
                                        <p className="text-sm text-slate-400">Izinkan pengguna baru mendaftar</p>
                                    </div>
                                    <button 
                                        onClick={toggleRegistration}
                                        className={`w-11 h-6 rounded-full relative transition-colors ${registration.allowRegistration ? 'bg-blue-500' : 'bg-slate-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${registration.allowRegistration ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Batas Maksimal User</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            value={registration.maxUsers}
                                            onChange={async (e) => {
                                                const val = parseInt(e.target.value);
                                                setRegistration(prev => ({ ...prev, maxUsers: val }));
                                                await updateDoc(doc(db, 'settings', 'registration'), { maxUsers: val });
                                            }}
                                            className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-1 flex-1"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Otomatis simpan saat diketik</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
