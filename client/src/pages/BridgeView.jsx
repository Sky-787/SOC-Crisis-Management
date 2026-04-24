import React, { useState, useEffect } from 'react';
import useCrisisStore from '../stores/crisisStore';
import useCriticalState from '../hooks/useCriticalState';
import useSessionEnd from '../hooks/useSessionEnd';
import SocketService from '../services/socketService';
import { TextInput, ActionButton, AlertBanner } from '../components/Atoms';
import Navbar from '../components/Navbar';

const BridgeView = () => {
  useSessionEnd();
  const isCritical = useCriticalState();
  const { crisisState } = useCrisisStore();
  
  const [actionCode, setActionCode] = useState('');
  const [targetIp, setTargetIp] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [pendingAction, setPendingAction] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const handleActionResult = ({ success, protocol, effect, reason }) => {
      setPendingAction(false);
      if (success) {
        setFeedback({ type: 'success', message: `PROTOCOLO ACEPTADO: ${effect}` });
        setActionCode('');
        setTargetIp('');
        setSelectedProtocol(null);
      } else {
        const errors = {
          invalid_code: 'CÓDIGO INVÁLIDO: Verifica con el Monitor.',
          expired_code: 'CÓDIGO EXPIRADO: Solicita el nuevo código.',
          unauthorized_role: 'ERROR DE AUTORIZACIÓN: Rol no permitido.',
          unknown_protocol: 'PROTOCOLO DESCONOCIDO.'
        };
        setFeedback({ type: 'error', message: errors[reason] || 'ERROR EN LA OPERACIÓN' });
      }
    };

    SocketService.on('action-result', handleActionResult);
    return () => SocketService.off('action-result', handleActionResult);
  }, []);

  const handleExecute = (protocol) => {
    if (!actionCode) {
      setFeedback({ type: 'warning', message: 'INGRESA EL CÓDIGO DE ACCIÓN DICTADO POR EL MONITOR' });
      return;
    }

    if (protocol === 'block-ip' && !targetIp) {
      setFeedback({ type: 'warning', message: 'SE REQUIERE UNA IP OBJETIVO PARA ESTE PROTOCOLO' });
      return;
    }

    setFeedback(null);
    setPendingAction(true);
    setSelectedProtocol(protocol);
    
    SocketService.sendAction({
      protocol,
      action_code: actionCode.toUpperCase(),
      target_ip: targetIp
    });
  };

  return (
    <div className={`min-h-screen pt-20 pb-10 px-6 transition-colors duration-1000 ${isCritical ? 'bg-red-950/20' : 'bg-[#050505]'}`}>
      <Navbar />
      
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center space-x-4 mb-2">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/10">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-wider">Terminal de Mitigación (Bridge)</h1>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Ejecución de protocolos de emergencia</p>
          </div>
        </div>

        {feedback && <AlertBanner message={feedback.message} type={feedback.type} />}

        <div className="grid grid-cols-12 gap-8">
          {/* Left: Input Console */}
          <div className="col-span-5 space-y-6 p-8 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-white/5">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-2">Consola de Entrada</h3>
            
            <TextInput
              label="Action Code (desde Monitor)"
              placeholder="Ej: XJ92KL"
              value={actionCode}
              onChange={(e) => setActionCode(e.target.value)}
              disabled={pendingAction}
            />

            <div className={`transition-all duration-300 overflow-hidden ${selectedProtocol === 'block-ip' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
              <TextInput
                label="Target IP (Dirección Objetivo)"
                placeholder="Ej: 192.168.1.1"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                disabled={pendingAction}
              />
            </div>

            <div className="pt-4 p-4 bg-black/40 rounded-lg border border-white/5">
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
                Asegúrate de que el código coincida exactamente con el dictado por el Monitor. Los protocolos no pueden revertirse una vez ejecutados.
              </p>
            </div>
          </div>

          {/* Right: Protocol Buttons */}
          <div className="col-span-7 space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-2">Protocolos Disponibles</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {crisisState?.availableProtocols.map((protocol) => {
                const info = {
                  'isolate-network': { 
                    label: 'Aislar Red (Isolate Network)', 
                    desc: 'Reduce el volumen de tráfico en un 50%', 
                    variant: 'warning' 
                  },
                  'generate-decryption-key': { 
                    label: 'Generar Llave (Decryption Key)', 
                    desc: 'Reduce el porcentaje de encriptación en 30 pts', 
                    variant: 'success' 
                  },
                  'block-ip': { 
                    label: 'Bloquear Dirección (Block IP)', 
                    desc: 'Elimina una IP específica del mapa de tráfico', 
                    variant: 'danger' 
                  }
                }[protocol];

                return (
                  <button
                    key={protocol}
                    onClick={() => {
                      if (protocol === 'block-ip' && selectedProtocol !== 'block-ip') {
                        setSelectedProtocol('block-ip');
                      } else {
                        handleExecute(protocol);
                      }
                    }}
                    disabled={pendingAction}
                    className={`group relative p-6 rounded-2xl border text-left transition-all duration-300 ${
                      selectedProtocol === protocol 
                        ? 'bg-white/5 border-white/30 scale-[1.02] shadow-xl' 
                        : 'bg-gray-900/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${
                          selectedProtocol === protocol ? 'text-white' : 'text-gray-300'
                        }`}>
                          {info.label}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">{info.desc}</p>
                      </div>
                      <div className={`p-2 rounded-lg transition-colors ${
                        selectedProtocol === protocol ? 'bg-white/10' : 'bg-black/20'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          selectedProtocol === protocol ? 'text-white' : 'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    
                    {selectedProtocol === protocol && protocol !== 'block-ip' && (
                      <div className="mt-4 animate-in fade-in slide-in-from-left-2 duration-300">
                        <ActionButton 
                          label="Confirmar Ejecución" 
                          variant={info.variant}
                          className="w-full text-[10px]"
                        />
                      </div>
                    )}
                    
                    {protocol === 'block-ip' && selectedProtocol === 'block-ip' && (
                      <div className="mt-4 animate-in fade-in slide-in-from-left-2 duration-300">
                        <ActionButton 
                          label="Bloquear IP" 
                          variant="danger"
                          className="w-full text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecute('block-ip');
                          }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BridgeView;
