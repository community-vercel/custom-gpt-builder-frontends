'use client';

import ChatbotPreview from '../components/ChatbotPreview';

const ChatbotEmbedPage = () => {
  // Get parameters from URL
  const searchParams = new URLSearchParams(window.location.search);
  const theme = searchParams.get('theme') || 'light';
  const width = searchParams.get('width') || '400px';
  const height = searchParams.get('height') || '600px';

  // These would normally come from your API based on the user's flow
  const demoNodes = [
    {
      id: '1',
      type: 'text',
      data: { label: 'Hello! How can I help you today?' },
      position: { x: 0, y: 0 }
    },
    {
      id: '2',
      type: 'custom',
      data: { 
        label: 'Choose an option', 
        options: ['Support', 'Sales', 'Feedback'] 
      },
      position: { x: 0, y: 100 }
    }
  ];

  const demoEdges = [
    { id: 'e1-2', source: '1', target: '2' }
  ];

  return (
    <div style={{ width, height }}>
      <ChatbotPreview 
        nodes={demoNodes} 
        edges={demoEdges} 
        embedded={true}
        theme={theme}
      />
    </div>
  );
};

export default ChatbotEmbedPage;