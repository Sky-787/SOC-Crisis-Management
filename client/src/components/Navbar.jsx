import React from 'react';
import { useNavigate } from 'react-router-dom';
import useCrisisStore from '../stores/crisisStore';
import SocketService from '../services/socketService';
import { StatusIndicator } from './Atoms';

const Navbar = () => {
  const navigate = useNavigate();
  const { playerName, playerRole, socketConnected, reset } = useCrisisStore();

  const handleAbort = () => {
    if (window.confirm("¿ESTÁS SEGURO DE ABORTAR LA MISIÓN? SE PERDERÁ TODO EL PROGRESO.")) {
      SocketService.disconnect();
      reset();
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-50">
      <div className="flex items-center space-x-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] leading-none mb-1">Operación</span>
          <span className="text-sm font-bold text-white tracking-wider uppercase">Crisis Management</span>
        </div>
        
        <div className="h-8 w-[1px] bg-white/10" />
        
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Agente</span>
          <span className="text-xs font-medium text-white/90 uppercase tracking-wide">{playerName || '---'}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Rol</span>
          <span className={`text-xs font-bold uppercase tracking-wide ${playerRole === 'Monitor' ? 'text-amber-400' : 'text-purple-400'}`}>
            {playerRole || '---'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <StatusIndicator connected={socketConnected} />
        
        <button
          onClick={handleAbort}
          className="px-4 py-1.5 border border-red-500/50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-500 hover:text-white transition-all duration-300"
        >
          Abortar Misión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
