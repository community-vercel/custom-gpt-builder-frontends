
import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { FiSettings, FiSend } from 'react-icons/fi';

export default function ChatBotUI({ id, data, selected }) {
console.log('ChatBotUI', id, data, selected);


  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState(data.config || {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    systemPrompt: 'You are a helpful assistant',
    openai: { apiKey: '' },
    gemini: { apiKey: '' },
    deepseek: { apiKey: '' }
  });

  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (data.onConfigChange) {
      data.onConfigChange(newConfig);
    }
  };

  const sendMessage = async (message) => {
    if (!message) return;

    // Add user message to chat history
    setChatHistory((prev) => [
      ...prev,
      { sender: 'user', text: message }
    ]);
    setMessage('');
    setLoading(true);

    try {
      // Get response based on selected provider
      const response = await fetchChatBotResponse(message);

      // Add bot response to chat history
      setChatHistory((prev) => [
        ...prev,
        { sender: 'bot', text: response }
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error occurred. Please try again.' }
      ]);
    }
    setLoading(false);
  };

  const fetchChatBotResponse = async (userMessage) => {
    const selectedProvider = config.provider;

    if (!selectedProvider) {
      return 'No chatbot provider selected. Please select from the AI Configuration Setting.';
    }

    switch (selectedProvider) {
      case 'openai':
        return await fetchOpenAIResponse(userMessage);
      case 'deepseek':
        return await fetchDeepSeekResponse(userMessage);
      case 'gemini':
        return await fetchGeminiResponse(userMessage);
      default:
        return 'Invalid provider selected.';
    }
  };

  // Fetch OpenAI Response
  const fetchOpenAIResponse = async (userMessage) => {
    const apiKey = config.openai.apiKey;
    const model = config.openai.model;
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: userMessage,
        max_tokens: 100,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    return data.choices[0].text.trim();
  };

  // Fetch DeepSeek Response
  const fetchDeepSeekResponse = async (userMessage) => {
    const apiKey = config.deepseek.apiKey;
    const response = await fetch('https://api.deepseek.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        message: userMessage,
      }),
    });
    const data = await response.json();
    return data.reply;
  };

  // Fetch Gemini Response
  const fetchGeminiResponse = async (userMessage) => {
    const apiKey = config.gemini.apiKey;
    const response = await fetch('https://api.gemini.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: userMessage,
        model: config.gemini.model,
      }),
    });
    const data = await response.json();
    return data.message;
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${selected ? 'border-purple-500' : 'border-gray-300'} bg-white w-80`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-purple-100">
            <FiSettings className="text-purple-600" />
          </div>
          <h4 className="font-bold text-sm text-gray-700">AI Chatbot</h4>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
        >
          {showConfig ? 'Hide' : 'Configure'}
        </button>
      </div>

      {showConfig && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Provider</label>
            <select
              value={config.provider}
              onChange={(e) => handleConfigChange('provider', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-xs"
            >
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Model</label>
            <select
              value={config.model}
              onChange={(e) => handleConfigChange('model', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-xs"
            >
              {config.provider === 'openai' && (
                <>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                </>
              )}
              {config.provider === 'deepseek' && (
                <>
                  <option value="deepseek-chat">DeepSeek Chat</option>
                  <option value="deepseek-coder">DeepSeek Coder</option>
                </>
              )}
              {config.provider === 'gemini' && (
                <>
                  <option value="gemini-pro">Gemini Pro</option>
                  <option value="gemini-ultra">Gemini Ultra</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">System Prompt</label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-xs"
              rows={3}
            />
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        <span className="font-medium">Current:</span> {config.provider} - {config.model}
      </div>

      <div className="flex items-center border-t pt-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(message)}
          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none"
          placeholder="Type your message..."
        />
        <button
          onClick={() => sendMessage(message)}
          className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
        >
          <FiSend />
        </button>
      </div>

      <div className="mt-3">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {chatHistory.map((chat, index) => (
              <div key={index} className={`text-${chat.sender === 'user' ? 'blue' : 'green'}-500`}>
                {chat.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}