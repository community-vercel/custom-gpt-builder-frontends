// pages/chatbot-iframe.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const ChatbotIframe = () => {
  const router = useRouter();
  const { flowId, theme, buttonText, buttonColor } = router.query;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

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

  const currentTheme = themes[theme] || themes.light;

  useEffect(() => {
    // Load initial message
    addMessage('bot', 'Hello! How can I help you today?');
  }, []);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const handleSend = () => {
    if (input.trim()) {
      addMessage('user', input.trim());
      // Process through flow - in a real app you'd call your API
      setTimeout(() => {
        addMessage('bot', `You said: ${input.trim()}`);
      }, 500);
      setInput('');
    }
  };

  return (
    <div 
      className="flex flex-col h-full"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
      }}
    >
      <div 
        className="p-3 flex justify-between items-center"
        style={{
          backgroundColor: currentTheme.primary,
          color: '#fff',
        }}
      >
        <h2 className="text-lg font-semibold">Chat with us</h2>
        {router.query.showCloseButton !== 'false' && (
          <button 
            onClick={() => window.parent.postMessage('closeChatbot', '*')}
            className="text-xl"
          >
            ×
          </button>
        )}
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ borderBottom: `1px solid ${currentTheme.border}` }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'bot' 
              ? 'bg-blue-100 mr-auto' 
              : 'bg-blue-500 text-white ml-auto'}`}
            style={{
              backgroundColor: msg.sender === 'bot' 
                ? `${currentTheme.primary}20` 
                : currentTheme.primary,
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="p-3 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-l"
          style={{
            borderColor: currentTheme.border,
          }}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded-r"
          style={{
            backgroundColor: currentTheme.primary,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotIframe;