const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3003;

// Socket.IO configuration for production and development
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://realtime-chat-app-98z2.vercel.app", "https://*.vercel.app"]
      : ["http://localhost:3003", "http://127.0.0.1:3003"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Store messages and users
let messages = [];
let users = new Map();

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
    
    // Add to messages array
    messages.push(message);
    
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
