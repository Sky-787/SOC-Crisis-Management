import React from 'react';
import useCrisisStore from '../stores/crisisStore';
import useCriticalState from '../hooks/useCriticalState';
import useSessionEnd from '../hooks/useSessionEnd';
import BarChart from '../components/BarChart';
import Navbar from '../components/Navbar';

const MonitorView = () => {
  useSessionEnd(); // Escucha fin de sesión
  const isCritical = useCriticalState();
  const { crisisState, actionCode } = useCrisisStore();

  const encryptionData = [
    { name: 'SISTEMA', value: crisisState?.encryptionPercentage ?? 0, color: isCritical ? '#ef4444' : '#3b82f6' }
  ];

  const trafficData = crisisState?.trafficMap.map(t => ({
    name: t.ip,
    value: t.volume,
    color: t.volume > 50 ? '#f59e0b' : '#10b981'
  })) ?? [];

  return (
    <div className={`min-h-screen pt-20 pb-10 px-6 transition-colors duration-1000 ${isCritical ? 'bg-red-950/20' : 'bg-[#050505]'}`}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Left Column: Metrics */}
        <div className="col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border transition-all duration-500 ${isCritical ? 'bg-red-900/10 border-red-500/30' : 'bg-gray-900/40 border-white/5'}`}>
              <BarChart 
                title="Estado de Encriptación (%)" 
                data={encryptionData} 
                xKey="name" 
                yKey="value" 
                color={isCritical ? "#ef4444" : "#3b82f6"}
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nivel Crítico</span>
                <span className={`text-xl font-black ${isCritical ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>
                  {crisisState?.encryptionPercentage ?? 0}%
                </span>
              </div>
            </div>

            <div className="p-6 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-white/5">
              <BarChart 
                title="Tráfico de Red Sospechoso" 
                data={trafficData} 
                xKey="name" 
                yKey="value" 
                color="#f59e0b"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fuentes de Ataque</span>
                <span className="text-xl font-black text-amber-500">
                  {trafficData.length} IPs
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-white/5 h-[400px] flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Registro de Accesos (Access Log)</h3>
            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[11px] pr-2 custom-scrollbar">
              {crisisState?.accessLog.slice().reverse().map((log, i) => (
                <div key={i} className="p-2 bg-black/30 border-l-2 border-blue-500/50 text-blue-100/70">
                  <span className="text-blue-500/50 mr-2">[{crisisState.accessLog.length - i}]</span>
                  {log}
                </div>
              ))}
              {(!crisisState?.accessLog || crisisState.accessLog.length === 0) && (
                <div className="h-full flex items-center justify-center text-gray-600 uppercase tracking-widest italic">
                  Esperando entrada de datos...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Action Code */}
        <div className="col-span-4">
          <div className={`p-8 rounded-2xl border h-full flex flex-col items-center justify-center text-center transition-all duration-500 ${isCritical ? 'bg-red-900/20 border-red-500/50 shadow-2xl shadow-red-900/20' : 'bg-amber-900/10 border-amber-500/30'}`}>
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mb-8 shadow-lg shadow-amber-500/10">
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            
            <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Código de Acción Vital</h2>
            
            <div className="bg-black/50 border border-amber-500/20 px-8 py-6 rounded-xl mb-6">
              <span className="text-6xl font-black text-white tracking-[0.2em] font-mono select-all">
                {actionCode || '------'}
              </span>
            </div>
            
            <p className="text-gray-400 text-sm max-w-[200px] leading-relaxed">
              Dicta este código <span className="text-white font-bold italic">exactamente</span> como aparece al Técnico para validar protocolos.
            </p>
            
            <div className="mt-12 w-full pt-8 border-t border-white/5">
              <div className="flex items-center justify-center space-x-2 text-[10px] text-amber-500/50 font-bold uppercase tracking-widest animate-pulse">
                <div className="w-1 h-1 bg-amber-500 rounded-full" />
                <span>Actualizando Código...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorView;
