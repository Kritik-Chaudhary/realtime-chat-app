const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3003;

// Socket.IO configuration optimized for Vercel
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? function(origin, callback) {
          // Allow requests from any vercel.app domain and your specific domain
          if (!origin) return callback(null, true); // Allow requests with no origin (mobile apps, etc.)
          if (origin.includes('vercel.app') || origin.includes('localhost')) {
            return callback(null, true);
          }
          return callback(new Error('Not allowed by CORS'));
        }
      : ["http://localhost:3003", "http://127.0.0.1:3003"],
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

// Enhanced logging
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', PORT);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

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
    console.log('Received message from client:', data);
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
    
    console.log('Message added:', message);
    console.log('Total messages:', messages.length);
    
    // Broadcast message to all clients
    io.emit('new_message', message);
    console.log('Message broadcasted to all clients');
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
    console.log('Client disconnected');
    
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
