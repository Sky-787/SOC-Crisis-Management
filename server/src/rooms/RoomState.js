/**
 * Factory que genera el CrisisState inicial para una Room nueva.
 * Todos los valores arrancan en estado "pre-ataque": encriptación en 0,
 * algunas IPs sospechosas ya detectadas y log vacío.
 */
function createInitialCrisisState() {
  return {
    encryptionPercentage: 0,
    trafficMap: [
      { ip: '192.168.1.101', volume: 120 },
      { ip: '10.0.0.45', volume: 85 },
      { ip: '172.16.0.23', volume: 200 },
    ],
    accessLog: [],
    availableProtocols: ['isolate-network', 'generate-decryption-key', 'block-ip'],
  };
}

module.exports = { createInitialCrisisState };
