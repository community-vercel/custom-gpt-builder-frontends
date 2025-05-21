import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FiSend } from 'react-icons/fi';

export default function SingleInputApi({ id, data, selected }) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    try {
      const aiResponse = await getAIResponse(data.apiConfig, inputValue);
      setResponse(aiResponse);
      
      if (data.onSubmit) {
        data.onSubmit({ 
          input: inputValue, 
          response: aiResponse,
          nodeId: id 
        });
      }
    } catch (error) {
      console.error('AI request failed:', error);
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${selected ? 'border-blue-500' : 'border-gray-300'} bg-white w-80`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div className="font-semibold mb-2">{data.label || 'AI Chat Input'}</div>
      
      <form onSubmit={handleSubmit} className="flex items-center mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={data.placeholder || 'Type your message...'}
          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiSend />
          )}
        </button>
      </form>

      {response && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
          <div className="font-medium text-xs text-gray-500 mb-1">AI Response:</div>
          <div>{response}</div>
        </div>
      )}
    </div>
  );
}

// Implement actual API calls here
async function getAIResponse(apiConfig, prompt) {
  if (!apiConfig) throw new Error('No API configuration provided');
  
  const { provider } = apiConfig;
  const config = apiConfig[provider];

  // Implement actual API calls based on the provider
  switch (provider) {
    case 'openai':
      return fetchOpenAI(config, prompt);
    case 'deepseek':
      return fetchDeepSeek(config, prompt);
    case 'gemini':
      return fetchGemini(config, prompt);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function fetchOpenAI(config, prompt) {
  // Implement actual OpenAI API call
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response from AI';
}

async function fetchDeepSeek(config, prompt) {
  // Implement DeepSeek API call
  // Similar structure to OpenAI
  return `DeepSeek response to: ${prompt}`;
}

async function fetchGemini(config, prompt) {
  // Implement Gemini API call
  // Similar structure to OpenAI
  return `Gemini response to: ${prompt}`;
}