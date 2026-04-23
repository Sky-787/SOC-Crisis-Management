require('dotenv').config();

const PORT = process.env.PORT || 3001;
const ROOM_CODE_INTERVAL_MS = parseInt(process.env.ROOM_CODE_INTERVAL_MS, 10) || 15000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

module.exports = { PORT, ROOM_CODE_INTERVAL_MS, CLIENT_ORIGIN };
