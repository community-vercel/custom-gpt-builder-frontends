(function() {
    // Parse configuration from data attribute
    const scriptElement = document.currentScript;
    const config = JSON.parse(scriptElement.dataset.config);
    
    // Create widget container
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget-container';
    widget.style.position = 'fixed';
    widget.style.zIndex = '9999';
    widget.style[config.position.includes('right') ? 'right' : 'left'] = '20px';
    widget.style[config.position.includes('bottom') ? 'bottom' : config.position.includes('top') ? 'top' : '50%'] = 
      config.position.includes('center') ? '50%' : '20px';
    widget.style.transform = config.position.includes('center') ? 'translateY(-50%)' : 'none';
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'chatbot-toggle-button';
    toggleButton.textContent = config.buttonText;
    toggleButton.style.backgroundColor = config.buttonColor;
    toggleButton.style.color = getContrastColor(config.buttonColor);
    toggleButton.style.padding = '10px 15px';
    toggleButton.style.borderRadius = '8px';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatbot-window';
    chatWindow.style.display = 'none';
    chatWindow.style.width = config.width || '350px';
    chatWindow.style.height = config.height || '500px';
    chatWindow.style.backgroundColor = themes[config.theme].background;
    chatWindow.style.color = themes[config.theme].text;
    chatWindow.style.border = `1px solid ${themes[config.theme].border}`;
    chatWindow.style.borderRadius = '8px';
    chatWindow.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    chatWindow.style.overflow = 'hidden';
    
    // Create header
    const header = document.createElement('div');
    header.style.padding = '12px 16px';
    header.style.backgroundColor = themes[config.theme].primary;
    header.style.color = '#fff';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    const title = document.createElement('h3');
    title.textContent = 'Chat with us';
    title.style.margin = '0';
    title.style.fontSize = '16px';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    
    header.appendChild(title);
    if (config.showCloseButton) {
      header.appendChild(closeButton);
    }
    
    // Create chat body
    const chatBody = document.createElement('div');
    chatBody.id = 'chatbot-body';
    chatBody.style.height = 'calc(100% - 110px)';
    chatBody.style.overflowY = 'auto';
    chatBody.style.padding = '12px';
    
    // Create input area
    const inputArea = document.createElement('div');
    inputArea.style.padding = '12px';
    inputArea.style.borderTop = `1px solid ${themes[config.theme].border}`;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your message...';
    input.style.width = '100%';
    input.style.padding = '8px 12px';
    input.style.border = `1px solid ${themes[config.theme].border}`;
    input.style.borderRadius = '4px';
    
    inputArea.appendChild(input);
    
    // Assemble chat window
    chatWindow.appendChild(header);
    chatWindow.appendChild(chatBody);
    chatWindow.appendChild(inputArea);
    
    // Add elements to widget
    widget.appendChild(toggleButton);
    widget.appendChild(chatWindow);
    document.body.appendChild(widget);
    
    // Toggle functionality
    let isOpen = false;
    
    toggleButton.addEventListener('click', () => {
      isOpen = !isOpen;
      chatWindow.style.display = isOpen ? 'block' : 'none';
    });
    
    closeButton.addEventListener('click', () => {
      isOpen = false;
      chatWindow.style.display = 'none';
    });
    
    // Theme definitions
    const themes = {
      light: {
        primary: '#3b82f6',
        background: '#ffffff',
        text: '#111827',
        border: '#e5e7eb',
      },
      dark: {
        primary: '#60a5fa',
        background: '#1f2937',
        text: '#f3f4f6',
        border: '#374151',
      },
      ocean: {
        primary: '#06b6d4',
        background: '#f0f9ff',
        text: '#082f49',
        border: '#bae6fd',
      },
    };
    
    // Helper function to determine text color based on background
    function getContrastColor(hexColor) {
      const r = parseInt(hexColor.substr(1, 2), 16);
      const g = parseInt(hexColor.substr(3, 2), 16);
      const b = parseInt(hexColor.substr(5, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#000000' : '#ffffff';
    }
    
    // Initialize chat with flow configuration
    function initChat() {
      // Here you would load the flow configuration from your API
      // For now we'll just show a welcome message
      addMessage('bot', 'Hello! How can I help you today?');
    }
    
    function addMessage(sender, text) {
      const messageElement = document.createElement('div');
      messageElement.style.marginBottom = '8px';
      messageElement.style.padding = '8px 12px';
      messageElement.style.borderRadius = '4px';
      messageElement.style.maxWidth = '80%';
      messageElement.style.wordWrap = 'break-word';
      
      if (sender === 'bot') {
        messageElement.style.backgroundColor = themes[config.theme].primary + '20';
        messageElement.style.marginRight = 'auto';
      } else {
        messageElement.style.backgroundColor = themes[config.theme].primary;
        messageElement.style.color = '#fff';
        messageElement.style.marginLeft = 'auto';
      }
      
      messageElement.textContent = text;
      chatBody.appendChild(messageElement);
      chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    // Handle user input
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        addMessage('user', input.value.trim());
        // Here you would process the user input through your flow
        // For now we'll just echo back
        setTimeout(() => {
          addMessage('bot', `You said: ${input.value.trim()}`);
        }, 500);
        input.value = '';
      }
    });
    
    // Initialize the chat
    initChat();
  })();