/**
 * Protocolo: generate-decryption-key
 * Función pura — no modifica el estado original.
 *
 * Efecto: reduce el encryptionPercentage en 30 puntos (mínimo 0).
 *
 * @param {object} state - CrisisState actual
 * @returns {object} Nuevo CrisisState con encryptionPercentage reducido
 */
function generateDecryptionKey(state) {
  return {
    ...state,
    encryptionPercentage: Math.max(0, state.encryptionPercentage - 30),
    accessLog: [
      ...state.accessLog,
      `[${new Date().toISOString()}] PROTOCOL EXECUTED: Decryption key applied — encryption reduced by 30%`,
    ],
  };
}

module.exports = { generateDecryptionKey };
