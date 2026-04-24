import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import useCrisisStore from '../stores/crisisStore';
import SocketService from '../services/socketService';
import { ActionButton } from '../components/Atoms';

const ResultView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reset } = useCrisisStore();
  
  const result = location.state;

  if (!result) {
    return <Navigate to="/" replace />;
  }

  const isVictory = result.type === 'resolved';

  const handleReturn = () => {
    SocketService.disconnect();
    reset();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className={`absolute inset-0 opacity-20 ${isVictory ? 'bg-green-900/10' : 'bg-red-900/10'}`} />
      
      <div className={`relative w-full max-w-2xl bg-gray-900/40 backdrop-blur-2xl border ${isVictory ? 'border-green-500/30' : 'border-red-500/30'} rounded-3xl p-12 shadow-2xl animate-in zoom-in fade-in duration-700`}>
        <div className="flex flex-col items-center text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border-2 ${isVictory ? 'bg-green-500/10 border-green-500/50 text-green-500 shadow-lg shadow-green-500/20' : 'bg-red-500/10 border-red-500/50 text-red-500 shadow-lg shadow-red-500/20'}`}>
            {isVictory ? (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <h1 className={`text-4xl font-black uppercase tracking-tighter mb-2 ${isVictory ? 'text-green-500' : 'text-red-500'}`}>
            {isVictory ? 'Crisis Resuelta' : 'Sistema Colapsado'}
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mb-12">Informe Final de Operación</p>

          <div className="grid grid-cols-3 gap-6 w-full mb-12">
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
              <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Puntuación</span>
              <span className={`text-3xl font-black ${isVictory ? 'text-green-400' : 'text-red-400'}`}>{result.crisis_score}</span>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
              <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tiempo Total</span>
              <span className="text-3xl font-black text-white">{result.tiempo_total_segundos}s</span>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
              <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Encriptación</span>
              <span className={`text-3xl font-black ${isVictory ? 'text-green-400' : 'text-red-400'}`}>{result.encryption_percentage_final}%</span>
            </div>
          </div>

          <div className="w-full p-6 bg-black/40 rounded-2xl border border-white/5 mb-12 text-left">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Resumen Táctico</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isVictory 
                ? "La coordinación entre el Monitor y el Técnico permitió interceptar el ataque de ransomware a tiempo. Se han recuperado los sistemas críticos y se ha procedido al aislamiento de las amenazas."
                : "A pesar de los esfuerzos de mitigación, el ransomware logró encriptar la infraestructura crítica. Se recomienda iniciar protocolos de recuperación ante desastres y restauración de backups externos."
              }
            </p>
          </div>

          <ActionButton 
            label="Volver al Lobby" 
            onClick={handleReturn}
            className="w-full py-4 text-lg"
            variant={isVictory ? 'success' : 'danger'}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultView;
