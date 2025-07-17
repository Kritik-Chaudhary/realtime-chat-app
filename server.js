const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 443;

// Socket.IO configuration optimized for Railway and other hosting platforms
const io = socketIo(server, {
  cors: {
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);                     // mobile / curl
      if (origin.includes('localhost') || origin.endsWith('.up.railway.app')) {
        return cb(null, true);
      }
      cb(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true, // Allow Engine.IO v3 clients
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  upgradeTimeout: 10000, // 10 seconds
  maxHttpBufferSize: 1e6, // 1MB
  transports: ['websocket', 'polling'], // Allow both transports
  allowUpgrades: true
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connectedUsers: users.size,
    messageCount: messages.length
  });
});

// Store messages and users
let messages = [];
let users = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  // Send message history to newly connected client
  socket.emit('message_history', messages);

  // Handle user joining
  socket.on('join', (username) => {
    users.set(socket.id, username);
    socket.username = username;
    
    // Notify all clients about new user
    socket.broadcast.emit('user_joined', username);
    
    // Send current online users
    io.emit('users_online', Array.from(users.values()));
  });

  // Handle new message
  socket.on('send_message', (data) => {
    const message = {
      id: Date.now(),
      username: data.username,
      message: data.message,
      timestamp: new Date().toISOString()
    };
    
    // Add to messages array (limit to last 100 messages to save memory)
    messages.push(message);
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }
    
    // Broadcast message to all clients
    io.emit('new_message', message);
  });

  // Handle user typing
  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data);
  });

  // Handle user stopped typing
  socket.on('stop_typing', (data) => {
    socket.broadcast.emit('user_stop_typing', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
      users.delete(socket.id);
      socket.broadcast.emit('user_left', socket.username);
      io.emit('users_online', Array.from(users.values()));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
