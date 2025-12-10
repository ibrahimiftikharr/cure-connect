'use client';

import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

const NOTIFICATION_SOCKET_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL!.replace('/api', '');

export const useNotificationSocket = (userId: string, onNotification: (notification: any) => void) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(NOTIFICATION_SOCKET_URL, {
      transports: ['polling', 'websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification service');
      setConnected(true);
      newSocket.emit('register', userId);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnected(false);
    });

    newSocket.on('new_notification', (notification) => {
      console.log('New notification received:', notification);
      onNotification(notification);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from notification service:', reason);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, onNotification]);

  return { socket, connected };
};
