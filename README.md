# 🚀 Real-Time Chat Application

**A modern, production-ready real-time chat application** built with Node.js, Express, and Socket.IO. Features a clean UI, dark/light theme toggle, and optimized performance for seamless communication.

## ✨ Features

### 💬 **Core Chat Features**
- **Real-time messaging** with Socket.IO WebSocket technology
- **User presence indicators** - See who's online
- **Join/leave notifications** - Know when users connect/disconnect
- **Typing indicators** - See when someone is typing
- **Message persistence** - Messages saved in localStorage
- **Message history** - Up to 100 recent messages stored
- **Auto-reconnection** - Seamless reconnection on network issues

### 🎨 **User Interface**
- **Dark/Light theme toggle** - Switch between themes instantly
- **Responsive design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, professional design
- **Smooth animations** - Enhanced user experience
- **Mobile-friendly sidebar** - Collapsible user list on mobile

### 🛠️ **Technical Features**
- **Production optimized** - Minimal logging, efficient code
- **Connection status indicator** - Real-time connection monitoring
- **Health check endpoint** - `/health` for monitoring
- **CORS configured** - Ready for cross-origin deployment
- **Memory efficient** - Automatic message cleanup

## 🚀 **Live Demo**

**Live Application**: [https://realtime-chat-app-production-1645.up.railway.app/](https://realtime-chat-app-production-1645.up.railway.app/)

*Try opening multiple tabs to test real-time messaging!*

## 📦 Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Setup
```bash
# Clone the repository
git clone https://github.com/Kritik-Chaudhary/realtime-chat-app.git

# Navigate to project directory
cd realtime-chat-app

# Install dependencies
npm install
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
*Uses nodemon for auto-restart on file changes*

### Production Mode
```bash
npm start
```

### Access the Application
- **Local**: `http://localhost:443`
- **Development**: `http://localhost:3000` (if PORT not set)

## 📁 Project Structure

```
realtime-chat-app/
├── public/                 # Client-side files
│   ├── index.html         # Main HTML structure
│   ├── client.js          # Client-side JavaScript (optimized)
│   └── styles.css         # CSS styles with theme support
├── server.js              # Express server & Socket.IO setup
├── package.json           # Dependencies & scripts
├── .gitignore            # Git ignore rules
└── README.md             # This documentation
```

## 🎯 Usage Guide

### Basic Usage
1. **Join**: Enter a username and click "Join Chat"
2. **Message**: Type in the input field and press Enter or click Send
3. **Theme**: Click the sun/moon icon to toggle dark/light mode
4. **Users**: View online users in the sidebar
5. **Logout**: Click the logout button to clear session

### Advanced Features
- **Message Persistence**: Messages are saved locally and restored on refresh
- **Typing Indicators**: See when others are typing
- **Auto-reconnection**: App automatically reconnects if connection is lost
- **Mobile Support**: Use hamburger menu on mobile devices

## 🌐 Deployment

### Railway Deployment (Recommended)

1. **Fork this repository** on GitHub
2. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Select this repository
3. **Automatic deployment**:
   - Railway auto-detects Node.js
   - Installs dependencies with `npm install`
   - Starts with `npm start`
   - Provides HTTPS and custom domain
4. **Environment**: Set `PORT=443` if needed

### Other Platforms
- **Heroku**: Works with Heroku's automatic Node.js buildpack
- **Vercel**: Deploy with Vercel's serverless functions
- **DigitalOcean**: Use App Platform for easy deployment

## 🔧 Configuration

### Environment Variables
```bash
PORT=443                    # Server port (default: 443)
NODE_ENV=production        # Environment mode
```

### Socket.IO Settings
- **Ping Timeout**: 60 seconds
- **Ping Interval**: 25 seconds
- **Max Buffer Size**: 1MB
- **Transports**: WebSocket, Polling

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **HTTP Server** - Built-in Node.js server

### Frontend
- **Vanilla JavaScript** - No frameworks, pure JS
- **HTML5** - Modern semantic markup
- **CSS3** - Advanced styling with variables
- **LocalStorage** - Client-side data persistence

### Features
- **WebSocket** - Real-time bidirectional communication
- **Responsive Design** - Mobile-first approach
- **Theme System** - CSS custom properties
- **Performance Optimized** - Minimal bundle size

## 🔍 API Endpoints

### HTTP Endpoints
- `GET /` - Serve the chat application
- `GET /health` - Health check endpoint

### Socket.IO Events

#### Client → Server
- `join(username)` - Join the chat room
- `send_message({username, message})` - Send a message
- `typing(username)` - User started typing
- `stop_typing(username)` - User stopped typing

#### Server → Client
- `message_history(messages[])` - Send message history
- `new_message(message)` - Broadcast new message
- `users_online(users[])` - Update online users list
- `user_joined(username)` - User joined notification
- `user_left(username)` - User left notification
- `user_typing(username)` - User typing notification
- `user_stop_typing(username)` - User stopped typing

## 🚀 Performance Optimizations

- **Minimal Logging**: Production-ready with essential logs only
- **Memory Management**: Automatic cleanup of old messages (100 message limit)
- **Connection Optimization**: Efficient reconnection handling
- **Bundle Size**: No unnecessary dependencies
- **Caching**: LocalStorage for message persistence
- **Debounced Typing**: Reduced server load from typing events

## 🔒 Security Features

- **CORS Protection**: Configured for specific domains
- **Input Sanitization**: Text content security
- **XSS Prevention**: Safe DOM manipulation
- **Rate Limiting**: Built-in Socket.IO protections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Kritik Chaudhary**
- GitHub: [@Kritik-Chaudhary](https://github.com/Kritik-Chaudhary)
- Email: root7807@gmail.com

---

⭐ **Star this repository if you found it helpful!**
