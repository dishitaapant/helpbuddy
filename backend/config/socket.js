// config/socket.js — Socket.io Handler (Chat + WebRTC Signaling)
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

// In-memory store for waiting users and active rooms
const waitingQueue = [];           // Users waiting for a random partner
const activeRooms = new Map();     // roomId → { user1, user2 }
const userRooms = new Map();       // socketId → roomId
const blockedUsers = new Map();    // userId → Set of blocked userIds

const socketHandler = (io) => {

  // ─── Auth Middleware for Socket ──────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userInitials = decoded.initials;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId} (${socket.id})`);

    // ─── CHAT: Join Random Chat Queue ──────────────────────────────────────────
    socket.on('join_queue', async () => {
      // Check if already in a room
      if (userRooms.has(socket.id)) {
        return socket.emit('already_in_room');
      }

      // Check if someone is waiting
      if (waitingQueue.length > 0) {
        const partner = waitingQueue.shift();

        // Make sure the partner is still connected
        const partnerSocket = io.sockets.sockets.get(partner.socketId);
        if (!partnerSocket) {
          // Partner disconnected while waiting, add self to queue
          waitingQueue.push({ socketId: socket.id, userId: socket.userId });
          return socket.emit('waiting_for_partner');
        }

        // Check if either user has blocked the other
        const myBlocked = blockedUsers.get(socket.userId) || new Set();
        const theirBlocked = blockedUsers.get(partner.userId) || new Set();
        if (myBlocked.has(partner.userId) || theirBlocked.has(socket.userId)) {
          waitingQueue.push({ socketId: socket.id, userId: socket.userId });
          return socket.emit('waiting_for_partner');
        }

        // Create a room
        const { v4: uuidv4 } = require('uuid');
        const roomId = uuidv4();

        activeRooms.set(roomId, {
          user1: { socketId: socket.id, userId: socket.userId, initials: socket.userInitials },
          user2: { socketId: partner.socketId, userId: partner.userId, initials: partner.userInitials },
        });
        userRooms.set(socket.id, roomId);
        userRooms.set(partner.socketId, roomId);

        socket.join(roomId);
        partnerSocket.join(roomId);

        // Notify both users
        io.to(roomId).emit('matched', {
          roomId,
          partnerInitials: null, // We send initials separately to each
        });
        socket.emit('partner_initials', { initials: partner.userInitials });
        partnerSocket.emit('partner_initials', { initials: socket.userInitials });

      } else {
        // No one waiting — add to queue
        waitingQueue.push({ socketId: socket.id, userId: socket.userId });
        socket.emit('waiting_for_partner');
      }
    });

    // ─── CHAT: Send Message ─────────────────────────────────────────────────────
    socket.on('send_message', async ({ content }) => {
      const roomId = userRooms.get(socket.id);
      if (!roomId) return socket.emit('error', { message: 'Not in a room' });

      // Sanitize content
      if (!content || typeof content !== 'string' || content.trim().length === 0) return;
      const sanitized = content.trim().substring(0, 1000); // Max 1000 chars

      const room = activeRooms.get(roomId);
      if (!room) return;

      // Save message to DB (store userId, NOT initials - initials derived on read)
      const message = new Message({
        roomId,
        sender: socket.userId,
        content: sanitized,
        timestamp: new Date(),
      });
      await message.save();

      // Broadcast to room with initials only
      io.to(roomId).emit('receive_message', {
        id: message._id,
        senderInitials: socket.userInitials,
        isSelf: false, // Each client will override for their own messages
        content: sanitized,
        timestamp: message.timestamp,
        senderId: socket.userId, // Clients use this to detect "self"
      });
    });

    // ─── CHAT: Leave Room ───────────────────────────────────────────────────────
    socket.on('leave_room', () => {
      handleLeaveRoom(socket, io);
    });

    // ─── CHAT: Block User ───────────────────────────────────────────────────────
    socket.on('block_user', () => {
      const roomId = userRooms.get(socket.id);
      if (!roomId) return;

      const room = activeRooms.get(roomId);
      if (!room) return;

      const partnerId =
        room.user1.socketId === socket.id ? room.user2.userId : room.user1.userId;

      // Add to blocked set
      if (!blockedUsers.has(socket.userId)) blockedUsers.set(socket.userId, new Set());
      blockedUsers.get(socket.userId).add(partnerId);

      // Leave the room
      handleLeaveRoom(socket, io);
      socket.emit('user_blocked', { message: 'User blocked successfully.' });
    });

    // ─── CHAT: Report User ──────────────────────────────────────────────────────
    socket.on('report_user', async ({ reason }) => {
      const roomId = userRooms.get(socket.id);
      if (!roomId) return;

      const room = activeRooms.get(roomId);
      if (!room) return;

      const partnerId =
        room.user1.socketId === socket.id ? room.user2.userId : room.user1.userId;

      // Save report to DB
      const Report = require('../models/Report');
      await new Report({
        reportedBy: socket.userId,
        reportedUser: partnerId,
        roomId,
        reason: reason || 'No reason provided',
      }).save();

      socket.emit('report_submitted', { message: 'Report submitted. Thank you.' });
    });

    // ─── CHAT: Identity Reveal Request ─────────────────────────────────────────
    socket.on('request_identity_reveal', () => {
      const roomId = userRooms.get(socket.id);
      if (!roomId) return;

      const room = activeRooms.get(roomId);
      if (!room) return;

      const partnerSocketId =
        room.user1.socketId === socket.id ? room.user2.socketId : room.user1.socketId;

      io.to(partnerSocketId).emit('identity_reveal_request', {
        from: socket.userId,
      });
    });

    socket.on('accept_identity_reveal', async () => {
      const roomId = userRooms.get(socket.id);
      if (!roomId) return;

      const room = activeRooms.get(roomId);
      if (!room) return;

      // Fetch both users' real names from DB
      const user1 = await User.findById(room.user1.userId).select('name email');
      const user2 = await User.findById(room.user2.userId).select('name email');

      // Send each user the other's real info
      io.to(room.user1.socketId).emit('identity_revealed', {
        name: user2.name,
        email: user2.email,
      });
      io.to(room.user2.socketId).emit('identity_revealed', {
        name: user1.name,
        email: user1.email,
      });
    });

    // ─── WEBRTC: Voice Call Signaling ───────────────────────────────────────────
    socket.on('call_request', () => {
      const roomId = userRooms.get(socket.id);
      if (!roomId) return;

      const room = activeRooms.get(roomId);
      if (!room) return;

      const partnerSocketId =
        room.user1.socketId === socket.id ? room.user2.socketId : room.user1.socketId;

      io.to(partnerSocketId).emit('incoming_call', { from: socket.id });
    });

    socket.on('call_accepted', ({ to }) => {
      io.to(to).emit('call_accepted');
    });

    socket.on('call_rejected', ({ to }) => {
      io.to(to).emit('call_rejected');
    });

    socket.on('call_ended', () => {
      const roomId = userRooms.get(socket.id);
      if (!roomId) return;
      socket.to(roomId).emit('call_ended');
    });

    // WebRTC SDP Offer/Answer/ICE forwarding
    socket.on('webrtc_offer', ({ to, offer }) => {
      io.to(to).emit('webrtc_offer', { from: socket.id, offer });
    });

    socket.on('webrtc_answer', ({ to, answer }) => {
      io.to(to).emit('webrtc_answer', { from: socket.id, answer });
    });

    socket.on('webrtc_ice_candidate', ({ to, candidate }) => {
      io.to(to).emit('webrtc_ice_candidate', { from: socket.id, candidate });
    });

    // ─── Disconnect ─────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
      // Remove from waiting queue
      const idx = waitingQueue.findIndex((u) => u.socketId === socket.id);
      if (idx !== -1) waitingQueue.splice(idx, 1);
      // Leave any active room
      handleLeaveRoom(socket, io);
    });
  });
};

// ─── Helper: Leave Room ─────────────────────────────────────────────────────────
function handleLeaveRoom(socket, io) {
  const roomId = userRooms.get(socket.id);
  if (!roomId) return;

  const room = activeRooms.get(roomId);
  if (room) {
    // Notify the other user
    const partnerSocketId =
      room.user1.socketId === socket.id ? room.user2.socketId : room.user1.socketId;
    io.to(partnerSocketId).emit('partner_left', {
      message: 'Your partner has left the chat.',
    });

    // Clean up
    userRooms.delete(room.user1.socketId);
    userRooms.delete(room.user2.socketId);
    activeRooms.delete(roomId);
  }

  socket.leave(roomId);
  userRooms.delete(socket.id);
}

module.exports = socketHandler;
