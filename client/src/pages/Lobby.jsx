import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SocketService from '../services/socketService';
import useCrisisStore from '../stores/crisisStore';
import { TextInput, ActionButton, AlertBanner } from '../components/Atoms';

const Lobby = () => {
  const navigate = useNavigate();
  const setPlayer = useCrisisStore((s) => s.setPlayer);
  
  const [formData, setFormData] = useState({
    playerName: '',
    room_id: '',
    role: 'Monitor'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleRoomJoined = ({ room_id, role }) => {
      setPlayer(formData.playerName, role, room_id);
      setIsLoading(false);
      if (role === 'Monitor') navigate('/ops/monitor');
      else navigate('/ops/bridge');
    };

    const handleJoinError = ({ message }) => {
      setError(message === 'Room is full' ? 'La sala está llena. Intentá con otro Room ID.' : message);
      setIsLoading(false);
    };

    SocketService.on('room-joined', handleRoomJoined);
    SocketService.on('join-error', handleJoinError);

    return () => {
      SocketService.off('room-joined', handleRoomJoined);
      SocketService.off('join-error', handleJoinError);
    };
  }, [formData.playerName, navigate, setPlayer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.playerName || !formData.room_id) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    SocketService.connect();
    SocketService.joinRoom(formData);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020202] relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.1)_0%,_transparent_50%)] animate-pulse" />
      <div className="scanline" />

      {/* Floating Blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />

      <div className="relative w-full max-w-[480px] p-1 shadow-2xl rounded-3xl bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 backdrop-blur-3xl animate-in zoom-in fade-in duration-700">
        <div className="bg-[#050505]/90 rounded-[22px] p-10 border border-white/5 relative overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-6 group transition-all duration-500 hover:scale-110 hover:border-blue-500/50">
              <svg className="w-10 h-10 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase glow-text">
              SOC <span className="text-blue-500">Crisis</span> Management
            </h1>
            <div className="flex items-center space-x-3 mt-3">
              <span className="h-[1px] w-4 bg-blue-500/50" />
              <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Acceso de Emergencia</p>
              <span className="h-[1px] w-4 bg-blue-500/50" />
            </div>
          </div>

          {error && <div className="mb-8"><AlertBanner message={error} type="error" /></div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <TextInput
                label="Nombre del Agente"
                placeholder="INGRESAR IDENTIFICADOR..."
                value={formData.playerName}
                onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
              />

              <TextInput
                label="ID de Operación (Room)"
                placeholder="EJ: ALPHA-07..."
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              />

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rol de Operación</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'Monitor' })}
                    className={`py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest border transition-all duration-300 ${
                      formData.role === 'Monitor' 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10 hover:bg-white/[0.07]'
                    }`}
                  >
                    Monitor
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'Técnico' })}
                    className={`py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest border transition-all duration-300 ${
                      formData.role === 'Técnico' 
                        ? 'bg-purple-500/10 border-purple-500 text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10 hover:bg-white/[0.07]'
                    }`}
                  >
                    Técnico
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 ${
                  isLoading 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? "Iniciando Protocolos..." : "Entrar a la Terminal"}
              </button>
            </div>
          </form>
          
          <div className="mt-12 flex justify-center items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.4em]">
              Servidor Seguro · v1.0.4
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
