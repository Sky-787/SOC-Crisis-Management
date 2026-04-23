const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { PORT, CLIENT_ORIGIN } = require('./config');
const roomsRouter = require('./routes/rooms');
const { registerSocketHandlers } = require('./socket/handlers');
const { swaggerUi, swaggerSpec } = require('./swagger/definition');

const app = express();
const httpServer = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[socket] cliente conectado: ${socket.id}`);
  registerSocketHandlers(io, socket);
});

// ── Middlewares ────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// ── Rutas REST ─────────────────────────────────────────────────────────────
app.use('/api/rooms', roomsRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta raíz informativa
app.get('/', (_req, res) => {
  res.json({
    message: 'SOC Crisis Management — Crisis_Server 🛡️',
    docs: '/api/docs',
    rooms: '/api/rooms',
  });
});

// 404 para rutas no definidas
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Arranque ───────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 Crisis_Server corriendo en http://localhost:${PORT}`);
  console.log(`📖 Swagger UI en http://localhost:${PORT}/api/docs`);
});

module.exports = { app, io };
