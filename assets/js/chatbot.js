(function() {
  "use strict";

  // Configuration
  const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://alitransfers-api.onrender.com'; // Update after deployment

  const API_ENDPOINT = `${BACKEND_URL}/api/chat`;

  // DOM Elements
  let chatContainer;
  let toggleBtn;
  let messagesDiv;
  let inputField;
  let sendBtn;

  // Initialize chatbot widget on DOM ready
  function initChatbot() {
    createChatbotWidget();
    attachEventListeners();
  }

  // Create chatbot widget HTML
  function createChatbotWidget() {
    const widget = document.createElement('div');
    widget.className = 'chatbot-widget';
    widget.innerHTML = `
      <button class="chatbot-toggle-btn" title="Open chat" aria-label="Open chatbot">
        <i class="bi bi-chat-dots"></i>
      </button>
      <div class="chatbot-container">
        <div class="chatbot-header">
          <h3>AliTransfers Chat</h3>
          <p>Ask about our services</p>
        </div>
        <div class="chatbot-messages"></div>
        <div class="chatbot-input-area">
          <input type="text" class="chatbot-input" placeholder="Ask something..." />
          <button class="chatbot-send-btn" title="Send message" aria-label="Send message">
            <i class="bi bi-send-fill"></i>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);

    // Cache elements
    chatContainer = widget.querySelector('.chatbot-container');
    toggleBtn = widget.querySelector('.chatbot-toggle-btn');
    messagesDiv = widget.querySelector('.chatbot-messages');
    inputField = widget.querySelector('.chatbot-input');
    sendBtn = widget.querySelector('.chatbot-send-btn');
  }

  // Attach event listeners
  function attachEventListeners() {
    toggleBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatContainer.classList.contains('active')) {
        closeChat();
      }
    });
  }

  // Toggle chat visibility
  function toggleChat() {
    chatContainer.classList.toggle('active');
    toggleBtn.classList.toggle('active');
    if (chatContainer.classList.contains('active')) {
      inputField.focus();
      addGreetingMessage();
    }
  }

  function closeChat() {
    chatContainer.classList.remove('active');
    toggleBtn.classList.remove('active');
  }

  // Add greeting message on first open
  function addGreetingMessage() {
    if (messagesDiv.children.length === 0) {
      addMessage('Hello! 👋 I\'m your AliTransfers assistant. Ask me about our transfer services, pricing, fleet, or anything else!', 'bot');
    }
  }

  // Add message to chat
  function addMessage(text, sender) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    messageEl.appendChild(bubble);
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Show typing indicator
  function showTypingIndicator() {
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message bot loading';
    messageEl.innerHTML = `
      <div class="chat-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return messageEl;
  }

  // Send message to backend
  async function sendMessage() {
    const message = inputField.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    inputField.value = '';
    sendBtn.disabled = true;
    inputField.disabled = true;

    // Show typing indicator
    const typingEl = showTypingIndicator();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      // Remove typing indicator
      typingEl.remove();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      addMessage(data.reply, 'bot');
    } catch (error) {
      typingEl.remove();
      const errorMsg = error.message.includes('Network') || error.message.includes('fetch')
        ? 'Unable to connect to the chat service. Please try again.'
        : error.message;
      addMessage(`Error: ${errorMsg}`, 'bot');
    } finally {
      sendBtn.disabled = false;
      inputField.disabled = false;
      inputField.focus();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
