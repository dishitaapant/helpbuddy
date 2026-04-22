// utils/socket.js — Socket.io client singleton
import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (token) => {
  if (!socket || socket.disconnected) {
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
