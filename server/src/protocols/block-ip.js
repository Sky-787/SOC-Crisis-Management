/**
 * Protocolo: block-ip
 * Función pura — no modifica el estado original.
 *
 * Efecto: elimina del trafficMap la IP especificada.
 *
 * @param {object} state - CrisisState actual
 * @param {string} targetIp - IP a bloquear
 * @returns {object} Nuevo CrisisState sin la IP bloqueada
 */
function blockIp(state, targetIp) {
  return {
    ...state,
    trafficMap: state.trafficMap.filter((entry) => entry.ip !== targetIp),
    accessLog: [
      ...state.accessLog,
      `[${new Date().toISOString()}] PROTOCOL EXECUTED: IP ${targetIp} blocked and removed from traffic map`,
    ],
  };
}

module.exports = { blockIp };
