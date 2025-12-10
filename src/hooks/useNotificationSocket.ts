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
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification service');
      setConnected(true);
      newSocket.emit('register', userId);
    });

    newSocket.on('new_notification', (notification) => {
      console.log('New notification received:', notification);
      onNotification(notification);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification service');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, onNotification]);

  return { socket, connected };
};
