# Real-Time Chat App

A simple real-time chat application built with Node.js, Express, and Socket.IO. Ready for both local development and production deployment on Vercel.

## Features

- Real-time messaging with Socket.IO
- User join/leave notifications
- Online users list
- Typing indicators
- Message history
- Dark/Light theme toggle
- Responsive design

## Installation

1. Make sure you have Node.js installed
2. Clone or download this repository
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3003
   ```

3. Enter a username and start chatting!

## Project Structure

```
realtime-chat-app/
├── public/
│   ├── index.html      # Main HTML file
│   ├── client.js       # Client-side JavaScript
│   ├── styles.css      # CSS styles
│   └── socket.io.js    # Socket.IO client library
├── server.js           # Express server and Socket.IO setup
├── package.json        # Project dependencies
└── README.md          # This file
```

## Local Development Only

This version has been simplified for local development:
- Removed production CORS configurations
- Removed external CDN dependencies
- Hardcoded localhost:3003 URL
- Removed deployment-specific code

## Usage

1. Open multiple browser tabs/windows to simulate multiple users
2. Enter different usernames in each tab
3. Messages will appear in real-time across all connected clients
4. User typing indicators show when someone is typing
5. Online users list shows all connected users

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect the Node.js app and deploy it
4. Update the CORS origin in server.js with your Vercel domain

### Environment Variables

For production deployment, make sure to set:
- `NODE_ENV=production`
- `PORT` (automatically set by Vercel)

## Technologies Used

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **WebSockets**: Socket.IO for real-time communication
- **Storage**: localStorage for message persistence
- **Deployment**: Vercel
