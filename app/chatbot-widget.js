// This would be hosted at https://yourdomain.com/chatbot-widget.js
window.initChatbotWidget = function(config) {
    // Create container
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget-container';
    widget.style.position = 'fixed';
    widget.style.width = config.size === 'small' ? '300px' : 
                        config.size === 'medium' ? '400px' : '500px';
    widget.style.height = config.size === 'small' ? '500px' : 
                         config.size === 'medium' ? '600px' : '700px';
    widget.style.zIndex = '9999';
    
    // Position styling
    if (config.position === 'center') {
      widget.style.top = '50%';
      widget.style.left = '50%';
      widget.style.transform = 'translate(-50%, -50%)';
    } else {
      const [vertical, horizontal] = config.position.split('-');
      widget.style[vertical] = '20px';
      widget.style[horizontal] = '20px';
    }
    
    // Theme styling
    widget.style.borderRadius = config.theme.borderRadius || '12px';
    widget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    widget.style.overflow = 'hidden';
    widget.style.display = 'flex';
    widget.style.flexDirection = 'column';
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `http://localhost:3000/chatbot-widget?flowId=${config.flowId}&theme=${encodeURIComponent(JSON.stringify(config.theme))}`;
    iframe.style.border = 'none';
    iframe.style.flexGrow = '1';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    
    widget.appendChild(iframe);
    document.body.appendChild(widget);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.background = 'rgba(0,0,0,0.2)';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '24px';
    closeButton.style.height = '24px';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.cursor = 'pointer';
    closeButton.style.zIndex = '10000';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(widget);
    });
    
    widget.appendChild(closeButton);
    
    // Handle messages from iframe
    window.addEventListener('message', (event) => {
      if (event.origin !== 'http://localhost:3000/') return;
      
      if (event.data.type === 'resize') {
        widget.style.height = event.data.height + 'px';
      }
    });
  };