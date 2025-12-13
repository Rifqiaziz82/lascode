import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function AIAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Halo! Saya Angkasa AI. Ada yang bisa saya bantu jelajahi hari ini?',
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const renderMessageWithBold = (text: string) => {
    // Pecah berdasarkan **...**
    const parts = text.split(/\*\*(.*?)\*\*/g);

    return parts.map((part, index) => {
        // Elemen di posisi ganjil adalah yang di dalam **
        if (index % 2 === 1) {
            return <strong key={index} className="font-bold">{part}</strong>;
        }
        return part;
    });
};

    // 👇 Buat sessionId unik per sesi (bisa diganti pakai localStorage/userId)
    const [sessionId] = useState(() => {
        return localStorage.getItem('sessionId') || crypto.randomUUID();
    });

    useEffect(() => {
        // Simpan sessionId ke localStorage biar tetap sama saat refresh
        localStorage.setItem('sessionId', sessionId);
    }, [sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            // 👇 Kirim ke webhook n8n
            const response = await fetch('https://n8n.dayoon.my.id/webhook/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionId, // <-- Sesuai gambar Postman
                    chatInput: inputText, // <-- Sesuai gambar Postman
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Validasi struktur respons
            if (!data.reply || typeof data.reply !== 'string') {
                throw new Error('Respons tidak valid dari server');
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply, // <-- Ambil dari field "reply"
                sender: 'ai',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);

        } catch (error) {
            console.error("Gagal kirim ke AI:", error);
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                text: "Maaf, terjadi kesalahan saat menghubungi server AI. Silakan coba lagi nanti.",
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 lg:bottom-6 right-4 lg:right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-72 sm:w-80 lg:w-96 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right animate-in fade-in slide-in-from-bottom-10">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-600 to-blue-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Angkasa AI</h3>
                                <span className="flex items-center gap-1.5 text-[10px] text-indigo-100">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                        msg.sender === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                                    }`}
                                >
                                    {renderMessageWithBold(msg.text)}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                                    <span
                                        className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                                        style={{ animationDelay: '0ms' }}
                                    ></span>
                                    <span
                                        className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                                        style={{ animationDelay: '150ms' }}
                                    ></span>
                                    <span
                                        className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                                        style={{ animationDelay: '300ms' }}
                                    ></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-slate-800 border-t border-slate-700">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ketik pesan..."
                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-full pl-4 pr-12 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isTyping}
                                className="absolute right-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-full text-white transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative max-lg:mb-20 flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                    isOpen
                        ? 'bg-slate-700 text-slate-300 rotate-90'
                        : 'bg-gradient-to-br from-slate-500 via-blue-500 to-blue-500 text-white animate-bounce-slow'
                }`}
            >
                {/* Glow Effect */}
                {!isOpen && (
                    <div className="absolute inset-0 rounded-full bg-indigo-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                )}

                <div className="relative z-10">
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <>
                            <Bot className="w-6 h-6 lg:w-7 lg:h-7" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        </>
                    )}
                </div>
            </button>
        </div>
    );
}