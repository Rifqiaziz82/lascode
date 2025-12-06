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
  createdAt: Date;
}

// Utility: simulate unique ID 
export const generateId = () => Math.random().toString(36).substring(2, 10);

// Utility: save to localStorage
export const STORAGE_KEY = 'space_admin_posts';

// Component: Input Field Reusable
interface InputFieldProps {
  label: string;
  id: string;
  type: 'text' | 'date' | 'url' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  Icon: React.ElementType;
}

export const InputField: React.FC<InputFieldProps> = ({ label, id, type, value, onChange, required = true, Icon }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-white flex items-center">
      <Icon size={16} className="mr-2 text-blue-400" />
      {label} {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={4}
        className="w-full px-4 py-2 border border-slate-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition duration-150"
        style={{ resize: 'none' }}
      />
    ) : (
      <input
        id={id}
        type={type === 'url' ? 'text' : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={`Masukkan ${label.toLowerCase()}`}
        className="w-full px-4 py-2 border border-slate-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition duration-150"
      />
    )}
  </div>
);

// Component: Floating Action Button 
export const FloatingActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-18 right-6 bg-blue-600 hover:bg-blue-500 p-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400 z-50"
    aria-label="Tambah Postingan Baru"
  >
    <Plus size={28} className="text-white" />
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-gray-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-blue-400 hover:text-red-400 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};