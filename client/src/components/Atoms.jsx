import React from 'react';

export const StatusIndicator = ({ connected }) => (
  <div className="flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full border border-white/10">
    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
    <span className="text-xs font-medium text-white/70">
      {connected ? 'SISTEMA ONLINE' : 'SISTEMA OFFLINE'}
    </span>
  </div>
);

export const ActionButton = ({ label, onClick, disabled, variant = 'primary' }) => {
  const baseStyles = "px-4 py-2 rounded font-bold transition-all duration-200 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border border-blue-400/30",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 border border-red-400/30",
    success: "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 border border-green-400/30",
    warning: "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20 border border-amber-400/30",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {label}
    </button>
  );
};

export const TextInput = ({ label, value, onChange, error, placeholder, type = "text" }) => (
  <div className="flex flex-col space-y-1 w-full">
    {label && <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`bg-gray-900 border ${error ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500 transition-colors font-mono`}
    />
    {error && <span className="text-red-500 text-[10px] uppercase font-bold tracking-tight">{error}</span>}
  </div>
);

export const AlertBanner = ({ message, type = 'error' }) => {
  const colors = {
    error: 'bg-red-900/40 border-red-500 text-red-200',
    warning: 'bg-amber-900/40 border-amber-500 text-amber-200',
    info: 'bg-blue-900/40 border-blue-500 text-blue-200',
    success: 'bg-green-900/40 border-green-500 text-green-200',
  };

  return (
    <div className={`px-4 py-2 border-l-4 ${colors[type]} rounded text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300`}>
      {message}
    </div>
  );
};
