import { io } from 'socket.io-client';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let socket = null;
const connect = (token) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  socket.on('connect', () => {
  });
  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });
  socket.on('disconnect', (reason) => {
  });
  return socket;
};
const getSocket = () => socket;
const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
const socketService = { connect, getSocket, disconnect };
export default socketService;
