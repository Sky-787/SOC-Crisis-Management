import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SocketService from "../services/socketService";

function useSessionEnd() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCrisisResolved = (data) => {
      navigate("/result", { state: { ...data, type: "resolved" } });
    };

    const handleCrisisLost = (data) => {
      navigate("/result", { state: { ...data, type: "lost" } });
    };

    SocketService.on("crisis-resolved", handleCrisisResolved);
    SocketService.on("crisis-lost", handleCrisisLost);

    return () => {
      SocketService.off("crisis-resolved", handleCrisisResolved);
      SocketService.off("crisis-lost", handleCrisisLost);
    };
  }, [navigate]);
}

export default useSessionEnd;
