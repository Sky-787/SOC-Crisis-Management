const { Router } = require('express');
const RoomManager = require('../rooms/RoomManager');

const router = Router();

/**
 * GET /api/rooms
 * Retorna la lista de rooms activas con resumen.
 */
router.get('/', (_req, res) => {
  const rooms = RoomManager.getAllRooms().map((room) => ({
    room_id: room.room_id,
    playerCount: room.players.size,
    encryptionPercentage: room.crisisState.encryptionPercentage,
  }));
  res.json(rooms);
});

/**
 * GET /api/rooms/:room_id
 * Retorna el CrisisState completo de una room.
 */
router.get('/:room_id', (req, res) => {
  const room = RoomManager.getRoom(req.params.room_id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room.crisisState);
});

/**
 * POST /api/rooms
 * Crea una room vacía y retorna su ID.
 */
router.post('/', (_req, res) => {
  // Genera un ID único tipo "ALPHA-01"
  const prefixes = ['ALPHA', 'BRAVO', 'DELTA', 'ECHO', 'FOXTROT'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
  const room_id = `${prefix}-${suffix}`;

  RoomManager.createRoom(room_id);
  res.status(201).json({ room_id });
});

module.exports = router;
