'use client';

import { useState, useEffect } from 'react';
import { FiSend, FiRefreshCw } from 'react-icons/fi';

const ChatbotPreview = ({ nodes, edges, embedded = false, theme = 'light' }) => {
  const [conversation, setConversation] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [formData, setFormData] = useState({});
  const [currentPath, setCurrentPath] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [aiResponses, setAiResponses] = useState({});

  const handleAiSubmit = async (nodeId, value) => {
    if (!value.trim()) return;
    
    addUserMessage(value);
    setInputValues(prev => ({ ...prev, [nodeId]: value }));

    const aiNode = nodes.find(n => n.id === nodeId);
    if (!aiNode) return;

    try {
      const aiResponse = `Simulated AI response to: "${value}"`;
      setAiResponses(prev => ({ ...prev, [nodeId]: aiResponse }));
      
      addBotMessage({
        type: 'ai',
        content: aiResponse,
        nodeId,
        timestamp: new Date().toLocaleTimeString()
      });

      proceedToNextNode(nodeId, { input: value, response: aiResponse });
    } catch (error) {
      addSystemMessage(`AI error: ${error.message}`);
    }
  };

  useEffect(() => {
    resetConversation();
  }, [nodes, edges]);

  const resetConversation = () => {
    setConversation([]);
    setSelectedOptions({});
    setFormData({});
    setCurrentPath([]);
    setInputValues({});
    setAiResponses({});
    startConversation();
  };

  const startConversation = () => {
    const startingNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    if (startingNodes.length > 0) {
      processNode(startingNodes[0]);
    }
  };

  const processNode = (node, userResponse = null) => {
    if (!node) return;

    const newPath = [...currentPath, node.id];
    setCurrentPath(newPath);

    if (node.type !== 'webhook') {
      addBotMessage(node);
    }

    switch (node.type) {
      case 'custom':
        break;
      case 'form':
      case 'singleInput':
      case 'aiinput':
        break;
      case 'condition':
        processCondition(node);
        break;
      case 'webhook':
        processWebhook(node);
        break;
      default:
        processDefault(node);
    }
  };

  const addBotMessage = (node) => {
    let message = {
      type: 'bot',
      content: node.data.label || getDefaultMessage(node.type),
      nodeType: node.type,
      nodeId: node.id,
      timestamp: new Date().toLocaleTimeString()
    };

    if (node.type === 'custom' && node.data.options) {
      message.options = node.data.options;
    }

    if (node.type === 'form' && node.data.fields) {
      message.fields = node.data.fields.map(field => ({
        ...field,
        options: field.type === 'select' ? (field.options || []) : undefined
      }));
    }

    if (node.type === 'singleInput' || node.type === 'aiinput') {
      message.inputConfig = {
        placeholder: node.data.placeholder || 'Type your answer...',
        buttonText: node.data.buttonText || 'Send'
      };
    }

    setConversation(prev => [...prev, message]);
  };

  const addUserMessage = (content) => {
    setConversation(prev => [...prev, {
      type: 'user',
      content,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const addSystemMessage = (content) => {
    setConversation(prev => [...prev, {
      type: 'system',
      content,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleOptionSelect = (nodeId, option, optionIndex) => {
    setSelectedOptions(prev => ({ ...prev, [nodeId]: option }));
    addUserMessage(option);

    const edge = edges.find(e => 
      e.source === nodeId && e.sourceHandle === `option-${optionIndex}`
    );

    if (edge) {
      const nextNode = nodes.find(n => n.id === edge.target);
      setTimeout(() => processNode(nextNode, option), 500);
    }
  };

  const handleFormSubmit = (nodeId, data) => {
    setFormData(prev => ({ ...prev, [nodeId]: data }));
    addUserMessage("Form submitted");
    proceedToNextNode(nodeId, data);
  };

  const handleSingleInputSubmit = (nodeId, value) => {
    if (!value.trim()) return;
    
    setInputValues(prev => ({ ...prev, [nodeId]: value }));
    addUserMessage(value);
    proceedToNextNode(nodeId, value);
  };

  const proceedToNextNode = (nodeId, data) => {
    const edge = edges.find(e => e.source === nodeId);
    if (edge) {
      const nextNode = nodes.find(n => n.id === edge.target);
      setTimeout(() => processNode(nextNode, data), 500);
    }
  };

  const processCondition = (node) => {
    const randomChoice = Math.random() > 0.5 ? 'yes' : 'no';
    const edge = edges.find(e => 
      e.source === node.id && e.sourceHandle === randomChoice
    );
    
    addSystemMessage(`Condition evaluated to: ${randomChoice.toUpperCase()}`);
    
    if (edge) {
      const nextNode = nodes.find(n => n.id === edge.target);
      setTimeout(() => processNode(nextNode), 500);
    }
  };

  const processWebhook = (node) => {
    addSystemMessage(`Calling webhook: ${node.data.method} ${node.data.url}`);
    proceedToNextNode(node.id);
  };

  const processDefault = (node) => {
    proceedToNextNode(node.id);
  };

  const getDefaultMessage = (nodeType) => {
    const messages = {
      'text': 'Hello!',
      'condition': 'Checking condition...',
      'webhook': 'Making API call...',
      'form': 'Please fill out this form:',
      'singleInput': 'Please answer:',
      'aiinput': 'Please answer:',
      'default': 'Message'
    };
    return messages[nodeType] || messages.default;
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 rounded-2xl shadow-lg transition-all duration-300 ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Chatbot</h2>
        <button 
          onClick={resetConversation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FiRefreshCw size={16} /> Restart
        </button>
      </div>

      <div className="relative bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-inner min-h-[400px] max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="font-medium text-sm">Chatbot</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Today at {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col animate-slide-up ${
                msg.type === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {msg.type === 'bot' ? 'Bot' : 
                 msg.type === 'ai' ? 'AI' : 
                 msg.type === 'user' ? 'You' : 'System'}
              </div>
              <div
                className={`p-4 rounded-2xl max-w-[80%] shadow-sm transition-all duration-200 ${
                  msg.type === 'bot' ? 'bg-gray-100 dark:bg-gray-700' : 
                  msg.type === 'ai' ? 'bg-purple-100 dark:bg-purple-900' :
                  msg.type === 'user' ? 'bg-blue-500 text-white' : 
                  'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <div className="text-sm">{msg.content}</div>

                {msg.options && msg.type === 'bot' && (
                  <div className="mt-3 space-y-2">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionSelect(msg.nodeId, opt, i)}
                        className="block w-full text-left text-sm p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {(msg.inputConfig && msg.type === 'bot') && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (msg.nodeType === 'aiinput') {
                        handleAiSubmit(msg.nodeId, inputValues[msg.nodeId] || '');
                      } else {
                        handleSingleInputSubmit(msg.nodeId, inputValues[msg.nodeId] || '');
                      }
                    }}
                    className="mt-3 flex gap-2"
                  >
                    <input
                      type="text"
                      value={inputValues[msg.nodeId] || ''}
                      onChange={(e) => setInputValues(prev => ({
                        ...prev,
                        [msg.nodeId]: e.target.value
                      }))}
                      placeholder={msg.inputConfig.placeholder}
                      className="flex-1 p-3 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                    />
                    <button
                      type="submit"
                      className={`p-3 rounded-r-lg transition-colors duration-150 ${
                        msg.nodeType === 'aiinput'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white flex items-center justify-center`}
                    >
                      <FiSend size={16} />
                    </button>
                  </form>
                )}

                {msg.fields && msg.type === 'bot' && (
                  <div className="mt-3 space-y-3">
                    {msg.fields.map((field, i) => (
                      <div key={i} className="text-sm">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
                          {field.label}
                        </label>
                        <input
                          type={field.type || 'text'}
                          placeholder={field.label}
                          className="w-full p-3 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                          required={field.required}
                          onChange={(e) => {
                            const data = { ...formData[msg.nodeId], [field.key]: e.target.value };
                            setFormData(prev => ({ ...prev, [msg.nodeId]: data }));
                          }}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => handleFormSubmit(msg.nodeId, formData[msg.nodeId])}
                      className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150 text-sm"
                    >
                      Submit
                    </button>
                  </div>
                )}

                {msg.type === 'ai' && aiResponses[msg.nodeId] && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    <div className="font-medium text-xs text-gray-500 dark:text-gray-400 mb-1">
                      AI Response:
                    </div>
                    <div>{aiResponses[msg.nodeId]}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPreview