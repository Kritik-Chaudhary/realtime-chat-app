// Initialize Socket.IO client with better error handling
const socket = io({
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  maxReconnectionAttempts: 5,
  timeout: 20000,
  forceNew: true
});

// Handle dark mode toggle
const themeToggleButton = document.getElementById('theme-toggle');
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        const currentTheme = document.body.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
    });
}

// Initialize theme based on saved preference
(function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
    }
})();

// Add connection debugging
console.log('Socket.IO connecting to the current server');
console.log('Current URL:', window.location.href);

// Add additional debugging for Socket.IO
socket.on('connect', () => {
    console.log('✅ Socket.IO connected successfully');
    console.log('Socket ID:', socket.id);
    console.log('Connected to:', socket.io.uri);
    updateConnectionStatus('Connected', 'green');
    
    // Rejoin if we have a username and we're not on the login screen
    if (username && chatContainer.style.display !== 'none') {
        socket.emit('join', username);
    }
});

// State variables
let username = '';
let messages = [];
let onlineUsers = [];
let typingUsers = [];
let typingTimeout;

// Load username from localStorage
function loadStoredUsername() {
    const storedUsername = localStorage.getItem('chatUsername');
    return storedUsername;
}

// Save username to localStorage
function saveUsername(user) {
    localStorage.setItem('chatUsername', user);
}

// Clear stored username
function clearStoredUsername() {
    localStorage.removeItem('chatUsername');
}

// DOM elements
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');
const onlineUsersContainer = document.getElementById('users-list');
const typingIndicator = document.getElementById('typing-indicator');
const chatContainer = document.getElementById('chat-container');
const userSection = document.getElementById('user-section');
const currentUsernameSpan = document.getElementById('current-username');
const logoutBtn = document.getElementById('logout-btn');

// Load messages from localStorage
function loadStoredMessages() {
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
        messages = JSON.parse(storedMessages);
        renderMessages();
    }
}

// Save messages to localStorage
function saveMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

// Merge messages from different sources (localStorage and server)
function mergeMessages(localMessages, serverMessages) {
    if (!localMessages || localMessages.length === 0) {
        return serverMessages;
    }
    
    if (!serverMessages || serverMessages.length === 0) {
        return localMessages;
    }
    
    // Create a map of existing messages by ID and timestamp to avoid duplicates
    const messageMap = new Map();
    
    // Add local messages first
    localMessages.forEach(msg => {
        const key = `${msg.id}-${msg.timestamp}`;
        messageMap.set(key, msg);
    });
    
    // Add server messages, avoiding duplicates
    serverMessages.forEach(msg => {
        const key = `${msg.id}-${msg.timestamp}`;
        if (!messageMap.has(key)) {
            messageMap.set(key, msg);
        }
    });
    
    // Convert back to array and sort by timestamp
    const merged = Array.from(messageMap.values());
    merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    console.log('Merged messages:', merged.length, 'from local:', localMessages.length, 'and server:', serverMessages.length);
    return merged;
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Render messages with optimization
function renderMessages() {
    console.log('Rendering messages:', messages);
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
        return;
    }
    
    // Clear existing messages
    messagesContainer.innerHTML = '';
    
    messages.forEach(msg => {
        const messageEl = document.createElement('div');
        const isOwnMessage = msg.username === username;
        messageEl.className = `message ${isOwnMessage ? 'own-message' : 'other-message'}`;
        
        // Use textContent for security and performance
        const userEl = document.createElement('div');
        userEl.className = 'message-user';
        userEl.textContent = msg.username;
        
        const textEl = document.createElement('div');
        textEl.className = 'message-text';
        textEl.textContent = msg.message;
        
        const timeEl = document.createElement('div');
        timeEl.className = 'message-time';
        timeEl.textContent = new Date(msg.timestamp).toLocaleTimeString();
        
        messageEl.appendChild(userEl);
        messageEl.appendChild(textEl);
        messageEl.appendChild(timeEl);
        
        fragment.appendChild(messageEl);
    });
    
    messagesContainer.appendChild(fragment);
    
    // Smooth scroll to bottom
    requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

// Render online users
function renderOnlineUsers() {
    onlineUsersContainer.innerHTML = '';
    onlineUsers.forEach(user => {
        const userItem = document.createElement('li');
        userItem.textContent = user;
        onlineUsersContainer.appendChild(userItem);
    });
}

// Render typing indicator
function renderTypingIndicator() {
    if (typingUsers.length > 0) {
        typingIndicator.textContent = `${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`;
        typingIndicator.style.display = 'block';
    } else {
        typingIndicator.style.display = 'none';
    }
}

// Join chat
function joinChat() {
    username = usernameInput.value.trim();
    if (username) {
        socket.emit('join', username);
        saveUsername(username);
        userSection.style.display = 'none';
        chatContainer.style.display = 'flex';
        currentUsernameSpan.textContent = username;
        messageInput.focus();
    }
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    console.log('Sending message:', message, 'from user:', username);
    if (message && username) {
        socket.emit('send_message', { username, message });
        messageInput.value = '';
        handleStopTyping();
    } else {
        console.log('Message not sent - either message is empty or username is missing');
    }
}

// Handle typing with debouncing
const debouncedHandleTyping = debounce(() => {
    if (username) {
        socket.emit('typing', username);
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            handleStopTyping();
        }, 1000);
    }
}, 300);

// Handle typing
function handleTyping() {
    debouncedHandleTyping();
}

// Handle stop typing
function handleStopTyping() {
    if (username) {
        socket.emit('stop_typing', username);
    }
    clearTimeout(typingTimeout);
}

// Handle connection status (merged with existing connect handler above)

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateConnectionStatus('Disconnected', 'red');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    updateConnectionStatus('Connection Error', 'red');
});

socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Reconnection attempt ${attemptNumber}`);
    updateConnectionStatus(`Reconnecting... (${attemptNumber})`, 'orange');
});

socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
    updateConnectionStatus('Reconnected', 'green');
    
    // Rejoin if we have a username and we're not on the login screen
    if (username && chatContainer.style.display !== 'none') {
        socket.emit('join', username);
    }
});

socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect');
    updateConnectionStatus('Connection Failed', 'red');
});

// Update connection status indicator
function updateConnectionStatus(status, color) {
    const statusIndicator = document.getElementById('connection-status');
    if (statusIndicator) {
        statusIndicator.textContent = status;
        statusIndicator.style.color = color;
    }
}

// Socket event listeners
socket.on('message_history', (history) => {
    console.log('Received message history from server:', history.length, 'messages');
    
    // Server only sends recent messages for new clients
    // We prioritize our stored messages for persistence
    const storedMessages = messages; // Current messages from localStorage
    
    if (storedMessages.length === 0 && history.length > 0) {
        // New client with no stored messages, use server history
        console.log('New client, loading server history');
        messages = history;
        renderMessages();
        saveMessages();
    } else if (storedMessages.length > 0) {
        // Existing client with stored messages, merge with server history
        const mergedMessages = mergeMessages(storedMessages, history);
        messages = mergedMessages;
        renderMessages();
        saveMessages();
        console.log('Merged stored messages with server history');
    }
});

socket.on('new_message', (message) => {
    console.log('Received new message:', message);
    messages.push(message);
    renderMessages();
    saveMessages();
});

socket.on('users_online', (users) => {
    onlineUsers = users;
    renderOnlineUsers();
});

socket.on('user_joined', (user) => {
    console.log(`${user} joined the chat`);
});

socket.on('user_left', (user) => {
    console.log(`${user} left the chat`);
});

socket.on('user_typing', (user) => {
    if (!typingUsers.includes(user)) {
        typingUsers.push(user);
        renderTypingIndicator();
    }
});

socket.on('user_stop_typing', (user) => {
    typingUsers = typingUsers.filter(u => u !== user);
    renderTypingIndicator();
});

// Clear messages function
function clearMessages() {
    localStorage.removeItem('chatMessages');
    messages = [];
    renderMessages();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout? This will clear your messages.')) {
        localStorage.removeItem('chatMessages');
        clearStoredUsername();
        username = '';
        
        // Disconnect and reconnect socket to ensure clean state
        socket.disconnect();
        setTimeout(() => {
            socket.connect();
        }, 100);
        
        userSection.style.display = 'block';
        chatContainer.style.display = 'none';
        usernameInput.value = '';
        usernameInput.focus();
        messages = [];
        onlineUsers = [];
        typingUsers = [];
        renderMessages();
        renderOnlineUsers();
        renderTypingIndicator();
        
        // Reset connection status
        updateConnectionStatus('Disconnected', 'orange');
    }
}

// Sidebar toggle functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadStoredMessages();
    
    // Check if user was previously logged in
    const storedUsername = loadStoredUsername();
    if (storedUsername) {
        username = storedUsername;
        usernameInput.value = username;
        
        // Automatically join chat with stored username
        console.log('Restoring chat session for user:', username);
        socket.emit('join', username);
        userSection.style.display = 'none';
        chatContainer.style.display = 'flex';
        currentUsernameSpan.textContent = username;
        messageInput.focus();
    } else {
        // Focus on username input if no stored username
        usernameInput.focus();
    }
    
    joinBtn.addEventListener('click', joinChat);
    sendBtn.addEventListener('click', sendMessage);
    logoutBtn.addEventListener('click', logout);
    
    // Sidebar toggle event listeners
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }
    
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinChat();
        }
    });
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', handleTyping);
});
