import { createContext, useContext, useEffect, useState } from "react";
import socketService from "../services/socketService";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      const newSocket = socketService.connect(token);
      setSocket(newSocket);

      newSocket.on("connect", () => setIsConnected(true));
      newSocket.on("disconnect", () => setIsConnected(false));
    }

    if (!user) {
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    return () => {
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
