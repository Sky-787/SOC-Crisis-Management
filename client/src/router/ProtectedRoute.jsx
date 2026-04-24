import { Navigate } from "react-router-dom";
import useCrisisStore from "../stores/crisisStore";

function ProtectedRoute({ children }) {
  const playerRole = useCrisisStore((s) => s.playerRole);
  
  if (playerRole === null) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
