function initChatbotWidget(config = {}) {
    const defaultConfig = {
      container: '#chatbot-widget-container',
      theme: 'light',
      width: '400px',
      height: '600px'
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${window.location.origin}/chatbot-embed?theme=${finalConfig.theme}&width=${finalConfig.width}&height=${finalConfig.height}`;
    iframe.width = finalConfig.width;
    iframe.height = finalConfig.height;
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    
    // Find container
    const container = typeof finalConfig.container === 'string' 
      ? document.querySelector(finalConfig.container)
      : finalConfig.container;
    
    if (container) {
      container.innerHTML = '';
      container.appendChild(iframe);
    } else {
      console.error('Chatbot widget container not found:', finalConfig.container);
    }
  }
  
  // Auto-init if data attribute is present
  document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('[data-chatbot-widget]');
    containers.forEach(container => {
      const theme = container.getAttribute('data-theme') || 'light';
      const width = container.getAttribute('data-width') || '400px';
      const height = container.getAttribute('data-height') || '600px';
      
      initChatbotWidget({
        container,
        theme,
        width,
        height
      });
    });
  });