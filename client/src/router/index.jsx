import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Lobby from "../pages/Lobby";
import MonitorView from "../pages/MonitorView";
import BridgeView from "../pages/BridgeView";
import ResultView from "../pages/ResultView";

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <Lobby /> 
  },
  {
    path: "/ops/monitor",
    element: (
      <ProtectedRoute>
        <MonitorView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ops/bridge",
    element: (
      <ProtectedRoute>
        <BridgeView />
      </ProtectedRoute>
    ),
  },
  { 
    path: "/result", 
    element: <ResultView /> 
  },
]);

export default router;
