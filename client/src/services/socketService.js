import { io } from "socket.io-client";
import useCrisisStore from "../stores/crisisStore";

let socket = null;

const SocketService = {
  connect() {
    if (socket?.connected) return;
    
    // El design.md menciona http://localhost:3001 como default
    const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
    socket = io(serverUrl);

    socket.on("connect", () => {
      console.log("Connected to Crisis Server");
      useCrisisStore.getState().setConnection(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Crisis Server");
      useCrisisStore.getState().setConnection(false);
    });

    socket.on("update-state", (state) => {
      useCrisisStore.getState().setCrisisState(state);
    });

    socket.on("action-code-update", ({ code }) => {
      useCrisisStore.getState().setActionCode(code);
    });
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  joinRoom(payload) {
    // payload: { room_id, playerName, role }
    if (!socket?.connected) this.connect();
    socket?.emit("join-room", payload);
  },

  sendAction(payload) {
    // payload: { protocol, action_code, target_ip? }
    socket?.emit("action", payload);
  },

  on(event, cb) {
    socket?.on(event, cb);
  },

  off(event, cb) {
    socket?.off(event, cb);
  },
};

export default SocketService;
