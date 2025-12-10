const socketIO = require('socket.io');

let io;

// Initialize Socket.IO
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    path: '/socket.io/',
    allowUpgrades: true,
    perMessageDeflate: false,
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join', ({ userId, role }) => {
      const room = `${role}_${userId}`;
      socket.join(room);
      console.log(`User ${userId} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Get Socket.IO instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Emit event to doctor
const emitToDoctor = (doctorId, event, data) => {
  try {
    const io = getIO();
    const room = `doctor_${doctorId}`;
    io.to(room).emit(event, data);
    console.log(`Emitted ${event} to doctor room: ${room}`);
  } catch (error) {
    console.error(`Error emitting to doctor ${doctorId}:`, error);
  }
};

// Emit event to patient
const emitToPatient = (patientId, event, data) => {
  try {
    const io = getIO();
    const room = `patient_${patientId}`;
    io.to(room).emit(event, data);
    console.log(`Emitted ${event} to patient room: ${room}`);
  } catch (error) {
    console.error(`Error emitting to patient ${patientId}:`, error);
  }
};

// Emit event to both doctor and patient
const emitToBoth = (doctorId, patientId, event, data) => {
  emitToDoctor(doctorId, event, data);
  emitToPatient(patientId, event, data);
};

// Event types
const EVENTS = {
  APPOINTMENT_BOOKED: 'appointmentBooked',
  APPOINTMENT_APPROVED: 'appointmentApproved',
  APPOINTMENT_REJECTED: 'appointmentRejected',
  APPOINTMENT_COMPLETED: 'appointmentCompleted',
};

module.exports = {
  initializeSocket,
  getIO,
  emitToDoctor,
  emitToPatient,
  emitToBoth,
  EVENTS,
};
