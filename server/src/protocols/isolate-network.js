/**
 * Protocolo: isolate-network
 * Función pura — no modifica el estado original.
 *
 * Efecto: reduce el volumen de cada IP en el trafficMap al 50%.
 *
 * @param {object} state - CrisisState actual
 * @returns {object} Nuevo CrisisState con trafficMap reducido
 */
function isolateNetwork(state) {
  return {
    ...state,
    trafficMap: state.trafficMap.map((entry) => ({
      ...entry,
      volume: Math.floor(entry.volume * 0.5),
    })),
    accessLog: [
      ...state.accessLog,
      `[${new Date().toISOString()}] PROTOCOL EXECUTED: Network isolated — all traffic volumes reduced by 50%`,
    ],
  };
}

module.exports = { isolateNetwork };
