import React from 'react';
import { Plus, X } from 'lucide-react';

// Type Definitions 
export interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventDate: Date;
  closingDate: Date;
  registrationLink: string;
  externalLink?: string;
  type: 'lomba' | 'beasiswa' | 'seminar' | 'acara';
  tags: string[];
  details?: { title: string; description: string }[];
  createdAt: Date;
  // Extended properties
  comments?: Record<string, any>;
  commentCount?: number;
  authorId?: string;
  author?: string; // Optional: often used for display
}

// Utility: simulate unique ID 
export const generateId = () => Math.random().toString(36).substring(2, 10);

// Utility: save to localStorage
export const STORAGE_KEY = 'space_admin_posts';

// Component: Glass Card (Standard Container)
export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-slate-900/90 md:bg-slate-900/50 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl backdrop-blur-none md:backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

// Component: Input Field Reusable
interface InputFieldProps {
  label: string;
  id: string;
  type: 'text' | 'date' | 'url' | 'textarea' | 'select' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  Icon?: React.ElementType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label, id, type, value, onChange, required = true, Icon, placeholder, options, className = ""
}) => (
  <div className={`space-y-2 ${className}`}>
    <label htmlFor={id} className="text-xs md:text-sm font-semibold text-slate-300 flex items-center gap-2 mb-1">
      {Icon && <Icon size={16} className="text-blue-400" />}
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={4}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-200 placeholder:text-slate-500"
        style={{ resize: 'none' }}
      />
    ) : type === 'select' ? (
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 appearance-none transition-all duration-200"
        >
          {options?.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </div>
    ) : (
      <input
        id={id}
        type={type === 'url' ? 'text' : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder || `Masukkan ${label.toLowerCase()}`}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-200 placeholder:text-slate-500"
      />
    )}
  </div>
);

// Component: Floating Action Button 
export const FloatingActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-blue-600 hover:bg-blue-500 p-4 rounded-full shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/30 z-40"
    aria-label="Tambah Postingan Baru"
  >
    <Plus size={24} className="text-white" />
  </button>
);

// Component: Modal
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 transition-opacity"
        onClick={onClose}
      />
      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-slate-900 border-b border-white/5 p-4 flex justify-between items-center z-10">
          <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 md:p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
};