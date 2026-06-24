const socketIO = require('socket.io');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Map of userId -> Set of socketIds (handles multiple active client tabs)
const activeUsers = new Map();

const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Register active user session
    socket.on('register', (userId) => {
      if (userId) {
        const uId = parseInt(userId);
        if (!activeUsers.has(uId)) {
          activeUsers.set(uId, new Set());
        }
        activeUsers.get(uId).add(socket.id);
        console.log(`User registered: UserID ${uId} on socket ${socket.id}`);
      }
    });

    // Handle peer-to-peer live chat sending
    socket.on('send_message', async ({ senderId, receiverId, message }) => {
      try {
        const sId = parseInt(senderId);
        const rId = parseInt(receiverId);

        // Store chat log in MySQL
        const chatMessage = await Message.create({
          sender_id: sId,
          receiver_id: rId,
          message
        });

        // Forward to sender's other tabs
        const senderSockets = activeUsers.get(sId);
        if (senderSockets) {
          senderSockets.forEach((sId) => {
            if (sId !== socket.id) {
              io.to(sId).emit('receive_message', chatMessage);
            }
          });
        }

        // Forward to recipient's sockets
        const recipientSockets = activeUsers.get(rId);
        if (recipientSockets) {
          recipientSockets.forEach((sId) => {
            io.to(sId).emit('receive_message', chatMessage);
          });
        }
      } catch (err) {
        console.error('Error handling socket send_message:', err.message);
      }
    });

    // WebRTC Signaling: Call Initializer
    socket.on('webrtc_offer', ({ offer, toUserId, fromUserId, appointmentId }) => {
      console.log(`Signaling: offer from user ${fromUserId} to ${toUserId}`);
      const targetSockets = activeUsers.get(parseInt(toUserId));
      if (targetSockets) {
        targetSockets.forEach((sId) => {
          io.to(sId).emit('webrtc_offer', {
            offer,
            fromUserId,
            appointmentId
          });
        });
      }
    });

    // WebRTC Signaling: Call Answer
    socket.on('webrtc_answer', ({ answer, toUserId, fromUserId }) => {
      console.log(`Signaling: answer from user ${fromUserId} to ${toUserId}`);
      const targetSockets = activeUsers.get(parseInt(toUserId));
      if (targetSockets) {
        targetSockets.forEach((sId) => {
          io.to(sId).emit('webrtc_answer', {
            answer,
            fromUserId
          });
        });
      }
    });

    // WebRTC Signaling: ICE Candidate Exchange
    socket.on('webrtc_ice_candidate', ({ candidate, toUserId, fromUserId }) => {
      console.log(`Signaling: ICE candidate from user ${fromUserId} to ${toUserId}`);
      const targetSockets = activeUsers.get(parseInt(toUserId));
      if (targetSockets) {
        targetSockets.forEach((sId) => {
          io.to(sId).emit('webrtc_ice_candidate', {
            candidate,
            fromUserId
          });
        });
      }
    });

    // WebRTC Signaling: Hang up / Call terminate
    socket.on('webrtc_hangup', ({ toUserId, fromUserId }) => {
      console.log(`Signaling: hangup between ${fromUserId} and ${toUserId}`);
      const targetSockets = activeUsers.get(parseInt(toUserId));
      if (targetSockets) {
        targetSockets.forEach((sId) => {
          io.to(sId).emit('webrtc_hangup', { fromUserId });
        });
      }
    });

    // Disconnect user socket
    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
      for (const [userId, sockets] of activeUsers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            activeUsers.delete(userId);
          }
          console.log(`Cleaned up UserID ${userId} socket registration.`);
          break;
        }
      }
    });
  });

  return io;
};

// Dispatch a live push notification if user is online
const notifyUser = (io, userId, notification) => {
  const uId = parseInt(userId);
  const sockets = activeUsers.get(uId);
  if (sockets && io) {
    sockets.forEach((socketId) => {
      io.to(socketId).emit('push_notification', notification);
    });
  }
};

module.exports = {
  initSocket,
  notifyUser
};
