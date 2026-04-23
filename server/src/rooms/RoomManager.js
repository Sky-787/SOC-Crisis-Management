const { createInitialCrisisState } = require('./RoomState');

/**
 * RoomManager — singleton que mantiene el estado de todas las rooms en memoria.
 *
 * Estructura de cada Room:
 * {
 *   room_id: string,
 *   players: Map<socketId, { socketId, playerName, role }>,
 *   crisisState: CrisisState,
 *   actionCode: string,
 *   degradationInterval: NodeJS.Timeout | null,
 *   actionCodeInterval: NodeJS.Timeout | null,
 *   startTime: number | null,   // Date.now() al emitir session-ready
 * }
 */

const rooms = new Map();

const RoomManager = {
  /**
   * Crea una Room nueva con CrisisState inicial.
   * Si ya existe una Room con ese ID, la retorna sin modificarla.
   */
  createRoom(room_id) {
    if (rooms.has(room_id)) return rooms.get(room_id);

    const room = {
      room_id,
      players: new Map(),
      crisisState: createInitialCrisisState(),
      actionCode: null,
      degradationInterval: null,
      actionCodeInterval: null,
      startTime: null,
    };

    rooms.set(room_id, room);
    return room;
  },

  /** Retorna la Room o undefined si no existe. */
  getRoom(room_id) {
    return rooms.get(room_id);
  },

  /**
   * Agrega un jugador a la Room.
   * playerInfo: { socketId, playerName, role }
   */
  addPlayer(room_id, socketId, playerInfo) {
    const room = rooms.get(room_id);
    if (!room) return;
    room.players.set(socketId, { socketId, ...playerInfo });
  },

  /** Elimina un jugador de la Room por su socketId. */
  removePlayer(room_id, socketId) {
    const room = rooms.get(room_id);
    if (!room) return;
    room.players.delete(socketId);
  },

  /** Busca la Room a la que pertenece un socketId. Retorna la Room o undefined. */
  getRoomBySocketId(socketId) {
    for (const room of rooms.values()) {
      if (room.players.has(socketId)) return room;
    }
    return undefined;
  },

  /** Retorna un array con todas las Rooms activas (para la API REST). */
  getAllRooms() {
    return Array.from(rooms.values());
  },

  /**
   * Elimina una Room limpiando sus intervals primero.
   * SIEMPRE llamar esto al terminar una sesión para evitar memory leaks.
   */
  deleteRoom(room_id) {
    const room = rooms.get(room_id);
    if (!room) return;

    if (room.degradationInterval) {
      clearInterval(room.degradationInterval);
      room.degradationInterval = null;
    }

    if (room.actionCodeInterval) {
      clearInterval(room.actionCodeInterval);
      room.actionCodeInterval = null;
    }

    rooms.delete(room_id);
  },
};

module.exports = RoomManager;
