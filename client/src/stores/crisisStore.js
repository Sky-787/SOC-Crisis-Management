import { create } from "zustand";

const initialState = {
  socketConnected: false,
  playerName: "",
  playerRole: null,       // "Monitor" | "Técnico" | null
  roomId: null,
  crisisState: null,
  actionCode: null,
};

const useCrisisStore = create((set, get) => ({
  ...initialState,

  setConnection: (connected) => set({ socketConnected: connected }),

  setPlayer: (name, role, roomId) =>
    set({ playerName: name, playerRole: role, roomId }),

  setCrisisState: (state) => set({ crisisState: state }),

  setActionCode: (code) => {
    // Solo actualiza si el rol es Monitor
    if (get().playerRole === "Monitor") {
      set({ actionCode: code });
    }
  },

  reset: () => set(initialState),
}));

export default useCrisisStore;
