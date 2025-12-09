'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL?.replace('/api', '') || 'http://localhost:5003';

export const useSocket = (userId: string, role: 'doctor' | 'patient', onEvent: (event: string, data: any) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId || !role) return;

    // Connect to Socket.IO server
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    // Join user-specific room
    socketRef.current.emit('join', { userId, role });

    // Listen for appointment events
    const events = [
      'appointmentBooked',
      'appointmentApproved',
      'appointmentRejected',
      'appointmentCompleted',
    ];

    events.forEach(event => {
      socketRef.current?.on(event, (data) => {
        console.log(`Received ${event}:`, data);
        onEvent(event, data);
      });
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, role, onEvent]);

  return socketRef.current;
};
