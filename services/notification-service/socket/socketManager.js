let io = null;
const connectedUsers = new Map(); // userId -> socketId

const initSocket = (socketIO) => {
  io = socketIO;
  
  io.on('connection', (socket) => {
    console.log('Client connected to notification service:', socket.id);

    // Register user
    socket.on('register', (userId) => {
      console.log(`User registered: ${userId}`);
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`User disconnected: ${socket.userId}`);
      }
    });
  });
};

const emitToUser = (userId, event, data) => {
  if (!io) return;
  
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    console.log(`Emitted ${event} to user ${userId}`);
  }
};

module.exports = {
  initSocket,
  emitToUser,
};
