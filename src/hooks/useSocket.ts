'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL!.replace('/api', '');

export const useSocket = (userId: string, role: 'doctor' | 'patient', onEvent: (event: string, data: any) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId || !role) return;

    // Connect to Socket.IO server
    socketRef.current = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to socket service');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
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
