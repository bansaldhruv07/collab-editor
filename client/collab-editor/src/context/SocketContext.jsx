import { createContext, useContext, useEffect, useState, useRef } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';
const SocketContext = createContext();
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectedUserId = useRef(null);
  useEffect(() => {
    if (user && user._id !== connectedUserId.current) {
      const token = localStorage.getItem('token');
      const newSocket = socketService.connect(token);
      connectedUserId.current = user._id;
      setSocket(newSocket);
      newSocket.on('connect', () => setIsConnected(true));
      newSocket.on('disconnect', () => setIsConnected(false));
    }
    if (!user && connectedUserId.current) {
      socketService.disconnect();
      connectedUserId.current = null;
      setSocket(null);
      setIsConnected(false);
    }
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