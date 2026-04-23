const RoomManager = require('../rooms/RoomManager');
const { isolateNetwork } = require('../protocols/isolate-network');
const { generateDecryptionKey } = require('../protocols/generate-decryption-key');
const { blockIp } = require('../protocols/block-ip');
const { ROOM_CODE_INTERVAL_MS } = require('../config');

// ── Utilidades ─────────────────────────────────────────────────────────────

/** Genera un Action_Code de 6 caracteres [A-Z0-9] con distribución uniforme. */
function generateActionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

/** Retorna el socket del Monitor dentro de una Room, o undefined. */
function getMonitorSocketId(room) {
  for (const player of room.players.values()) {
    if (player.role === 'Monitor') return player.socketId;
  }
  return undefined;
}

/** Agrega una IP aleatoria o incrementa el volumen de una existente. */
function updateTrafficMap(trafficMap) {
  const randomIp = () =>
    `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 254) + 1}`;

  // 40% de probabilidad de agregar una IP nueva, 60% de incrementar una existente
  if (trafficMap.length === 0 || Math.random() < 0.4) {
    return [...trafficMap, { ip: randomIp(), volume: Math.floor(Math.random() * 150) + 50 }];
  }

  const idx = Math.floor(Math.random() * trafficMap.length);
  return trafficMap.map((entry, i) =>
    i === idx ? { ...entry, volume: entry.volume + Math.floor(Math.random() * 30) + 5 } : entry
  );
}

// ── Fin de sesión ──────────────────────────────────────────────────────────

/**
 * Termina la sesión, calcula el score, emite el evento final y limpia la Room.
 * @param {import('socket.io').Server} io
 * @param {string} room_id
 * @param {'crisis-resolved'|'crisis-lost'} eventName
 */
function endSession(io, room_id, eventName) {
  const room = RoomManager.getRoom(room_id);
  if (!room) return;

  const tiempoSegundos = Math.floor((Date.now() - (room.startTime || Date.now())) / 1000);
  const encryptionFinal = room.crisisState.encryptionPercentage;
  const crisisScore = Math.max(0, 1000 - tiempoSegundos * 10 - encryptionFinal * 5);

  io.to(room_id).emit(eventName, {
    crisis_score: crisisScore,
    tiempo_total_segundos: tiempoSegundos,
    encryption_percentage_final: encryptionFinal,
  });

  console.log(`[session] ${eventName} — room: ${room_id} | score: ${crisisScore}`);
  RoomManager.deleteRoom(room_id);
}

// ── Ciclo de degradación ───────────────────────────────────────────────────

/**
 * Inicia el setInterval que empeora las métricas cada segundo.
 * @param {import('socket.io').Server} io
 * @param {string} room_id
 */
function startDegradationCycle(io, room_id) {
  const room = RoomManager.getRoom(room_id);
  if (!room) return;

  room.degradationInterval = setInterval(() => {
    const current = room.crisisState;
    const increment = Math.floor(Math.random() * 3) + 1; // 1–3

    room.crisisState = {
      ...current,
      encryptionPercentage: Math.min(100, current.encryptionPercentage + increment),
      accessLog: [
        ...current.accessLog,
        `[${new Date().toISOString()}] ALERT: Ransomware encrypted ${increment}% more files`,
      ],
      trafficMap: updateTrafficMap(current.trafficMap),
    };

    io.to(room_id).emit('update-state', room.crisisState);

    if (room.crisisState.encryptionPercentage >= 100) {
      endSession(io, room_id, 'crisis-lost');
    }
  }, 1000);
}

// ── Intervalo de Action_Code ───────────────────────────────────────────────

/**
 * Inicia el setInterval que renueva el Action_Code cada ROOM_CODE_INTERVAL_MS.
 * El código se emite SOLO al socket del Monitor.
 * @param {import('socket.io').Server} io
 * @param {string} room_id
 */
function startActionCodeInterval(io, room_id) {
  const room = RoomManager.getRoom(room_id);
  if (!room) return;

  // Emitir el primer código inmediatamente al iniciar la sesión
  room.actionCode = generateActionCode();
  const monitorId = getMonitorSocketId(room);
  if (monitorId) {
    io.to(monitorId).emit('action-code-update', { code: room.actionCode });
  }

  room.actionCodeInterval = setInterval(() => {
    const currentRoom = RoomManager.getRoom(room_id);
    if (!currentRoom) return;

    currentRoom.actionCode = generateActionCode();
    const mId = getMonitorSocketId(currentRoom);
    if (mId) {
      io.to(mId).emit('action-code-update', { code: currentRoom.actionCode });
    }
  }, ROOM_CODE_INTERVAL_MS);
}

// ── Handlers de socket ─────────────────────────────────────────────────────

/**
 * Registra todos los handlers de eventos para un socket conectado.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function registerSocketHandlers(io, socket) {
  // ── join-room ────────────────────────────────────────────────────────────
  socket.on('join-room', ({ room_id, playerName, role } = {}) => {
    if (!room_id) {
      return socket.emit('join-error', { message: 'room_id is required' });
    }

    let room = RoomManager.getRoom(room_id);

    // Room llena
    if (room && room.players.size >= 2) {
      return socket.emit('join-error', { message: 'Room is full' });
    }

    // Crear room si no existe
    if (!room) {
      room = RoomManager.createRoom(room_id);
    }

    // Asignar rol: primero en entrar → Monitor, segundo → Técnico
    const assignedRole = room.players.size === 0 ? 'Monitor' : 'Técnico';

    RoomManager.addPlayer(room_id, socket.id, {
      playerName: playerName || 'Anónimo',
      role: assignedRole,
    });

    socket.join(room_id);
    socket.emit('room-joined', { room_id, role: assignedRole });

    console.log(`[join-room] ${playerName} (${assignedRole}) → room: ${room_id}`);

    // Si ya hay 2 jugadores, iniciar la sesión
    if (room.players.size === 2) {
      room.startTime = Date.now();
      io.to(room_id).emit('session-ready', { room_id });
      startDegradationCycle(io, room_id);
      startActionCodeInterval(io, room_id);
      console.log(`[session] iniciada — room: ${room_id}`);
    }
  });

  // ── action ───────────────────────────────────────────────────────────────
  socket.on('action', ({ protocol, action_code, target_ip } = {}) => {
    const room = RoomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const player = room.players.get(socket.id);

    // Solo el Técnico puede ejecutar acciones
    if (!player || player.role !== 'Técnico') {
      return socket.emit('action-result', { success: false, reason: 'unauthorized_role' });
    }

    // Validar que el protocolo existe
    if (!room.crisisState.availableProtocols.includes(protocol)) {
      return socket.emit('action-result', { success: false, reason: 'unknown_protocol' });
    }

    // Validar el Action_Code
    if (!room.actionCode || action_code !== room.actionCode) {
      const reason = room.actionCode === null ? 'expired_code' : 'invalid_code';
      return socket.emit('action-result', { success: false, reason });
    }

    // Aplicar el protocolo (función pura)
    let newState;
    let effect;

    switch (protocol) {
      case 'isolate-network':
        newState = isolateNetwork(room.crisisState);
        effect = 'Traffic volume reduced by 50% across all IPs';
        break;
      case 'generate-decryption-key':
        newState = generateDecryptionKey(room.crisisState);
        effect = `Encryption reduced by 30% (now at ${newState.encryptionPercentage}%)`;
        break;
      case 'block-ip':
        if (!target_ip) {
          return socket.emit('action-result', { success: false, reason: 'target_ip required for block-ip' });
        }
        newState = blockIp(room.crisisState, target_ip);
        effect = `IP ${target_ip} removed from traffic map`;
        break;
      default:
        return socket.emit('action-result', { success: false, reason: 'unknown_protocol' });
    }

    room.crisisState = newState;

    io.to(room.room_id).emit('action-result', { success: true, protocol, effect });
    io.to(room.room_id).emit('update-state', room.crisisState);

    console.log(`[action] ${protocol} ejecutado — room: ${room.room_id}`);

    // Victoria si encryptionPercentage llega a 0
    if (room.crisisState.encryptionPercentage <= 0) {
      endSession(io, room.room_id, 'crisis-resolved');
    }
  });

  // ── disconnect ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const room = RoomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const player = room.players.get(socket.id);
    const room_id = room.room_id;

    console.log(`[disconnect] ${player?.playerName || socket.id} salió — room: ${room_id}`);

    // Notificar al jugador restante
    socket.to(room_id).emit('player-disconnected', {
      message: `${player?.playerName || 'Tu compañero'} se desconectó. La sesión fue cancelada.`,
    });

    RoomManager.deleteRoom(room_id);
  });
}

module.exports = { registerSocketHandlers };
