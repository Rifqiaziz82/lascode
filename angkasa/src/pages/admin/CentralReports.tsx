import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AlertCircle, CheckCircle, Clock, Filter, Search, X, Mail, Calendar, Tag, FileText, Send } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface Report {
    id: string; // Changed to string for Firestore ID
    email: string;
    issue: string;
    category: string;
    date: string;
    status: 'Baru' | 'Proses' | 'Selesai';
    description: string;
    reply?: string; // Admin reply
    uid?: string;
}

export default function CentralReports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [replyText, setReplyText] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);

    useEffect(() => {
        // Real-time subscription to reports
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReports = snapshot.docs.map(doc => {
                 const data = doc.data();
                 return {
                     id: doc.id,
                     email: data.email || 'No Email',
                     issue: data.issue || 'No Issue',
                     category: data.category || 'General',
                     date: data.date || 'N/A',
                     status: data.status || 'Baru',
                     description: data.description || '',
                     reply: data.reply,
                     uid: data.uid
                 } as Report;
            });
            setReports(fetchedReports);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching reports:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleReply = async () => {
        if (!selectedReport || !replyText.trim()) return;
        setIsSendingReply(true);
        try {
            const reportRef = doc(db, 'reports', selectedReport.id);
            await updateDoc(reportRef, {
                reply: replyText,
                status: 'Selesai' // Auto-close ticket on reply? Or 'Proses'? Usually 'Selesai' if answered.
            });
            setReplyText('');
            setSelectedReport(null);
            alert("Balasan terkirim!");
        } catch (err) {
            console.error("Failed to send reply:", err);
            alert("Gagal mengirim balasan.");
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleStatusUpdate = async (reportId: string, newStatus: Report['status']) => {
         try {
            await updateDoc(doc(db, 'reports', reportId), {
                status: newStatus
            });
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    // Calculate stats
    const stats = {
        baru: reports.filter(r => r.status === 'Baru').length,
        proses: reports.filter(r => r.status === 'Proses').length,
        selesai: reports.filter(r => r.status === 'Selesai').length,
    };

    const filteredReports = reports.filter(report =>
        report.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 text-white">Loading Reports...</div>;

    return (
        <AdminLayout role="central">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Laporan Masalah</h1>
                    <p className="text-slate-400">Daftar laporan kendala dari pengguna website</p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-red-400/10 text-red-400">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Laporan Baru</p>
                            <p className="text-2xl font-bold text-white">{stats.baru}</p>
                        </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-yellow-400/10 text-yellow-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Sedang Proses</p>
                            <p className="text-2xl font-bold text-white">{stats.proses}</p>
                        </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-400/10 text-green-400">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Selesai</p>
                            <p className="text-2xl font-bold text-white">{stats.selesai}</p>
                        </div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-white">Semua Laporan</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Cari laporan..."
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-700/50 text-slate-400 text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Email Pelapor</th>
                                    <th className="px-6 py-4 font-medium">Kategori</th>
                                    <th className="px-6 py-4 font-medium">Masalah</th>
                                    <th className="px-6 py-4 font-medium">Tanggal</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                            Tidak ada laporan yang ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr
                                            key={report.id}
                                            onClick={() => setSelectedReport(report)}
                                            className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 text-slate-300">{report.email}</td>
                                            <td className="px-6 py-4 text-slate-400">{report.category}</td>
                                            <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{report.issue}</td>
                                            <td className="px-6 py-4 text-slate-400">{report.date}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    onClick={(e) => e.stopPropagation()}
                                                    value={report.status}
                                                    onChange={(e) => handleStatusUpdate(report.id, e.target.value as any)}
                                                    className={`
                                                        px-2.5 py-1 rounded-full text-xs font-medium border-none bg-opacity-10
                                                        ${report.status === 'Baru' ? 'bg-red-400 text-red-400' :
                                                            report.status === 'Proses' ? 'bg-yellow-400 text-yellow-400' :
                                                                'bg-green-400 text-green-400'}
                                                      `}
                                                >
                                                    <option value="Baru" className="bg-slate-800 text-slate-300">Baru</option>
                                                    <option value="Proses" className="bg-slate-800 text-slate-300">Proses</option>
                                                    <option value="Selesai" className="bg-slate-800 text-slate-300">Selesai</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedReport(report);
                                                    }}
                                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                                >
                                                    Tindak Lanjut
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                            <h3 className="text-xl font-bold text-white">Detail Laporan</h3>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${selectedReport.status === 'Baru' ? 'bg-red-400/10 text-red-400' :
                                    selectedReport.status === 'Proses' ? 'bg-yellow-400/10 text-yellow-400' :
                                        'bg-green-400/10 text-green-400'
                                    }`}>
                                    <AlertCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-white mb-1">{selectedReport.issue}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedReport.status === 'Baru' ? 'bg-red-400/10 text-red-400' :
                                            selectedReport.status === 'Proses' ? 'bg-yellow-400/10 text-yellow-400' :
                                                'bg-green-400/10 text-green-400'
                                            }`}>
                                            {selectedReport.status}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 flex items-center gap-1">
                                            <Tag size={12} /> {selectedReport.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Mail size={16} />
                                        <span className="text-sm">Email Pelapor</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedReport.email}</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Calendar size={16} />
                                        <span className="text-sm">Tanggal Laporan</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedReport.date}</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <FileText size={16} />
                                    <span className="text-sm">Deskripsi Masalah</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    {selectedReport.description}
                                </p>
                            </div>
                            
                            {/* Reply Section */}
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <Send size={16} />
                                    <span className="text-sm">Balasan Admin</span>
                                </div>
                                {selectedReport.reply ? (
                                    <p className="text-green-400">{selectedReport.reply}</p>
                                ) : (
                                    <div className="space-y-2">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Tulis balasan untuk user..."
                                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[80px]"
                                        />
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={handleReply}
                                                disabled={isSendingReply || !replyText.trim()}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                {isSendingReply ? 'Mengirim...' : 'Kirim Balasan'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
