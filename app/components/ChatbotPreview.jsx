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
    
    // Add user message
    addUserMessage(value);
    setInputValues(prev => ({ ...prev, [nodeId]: value }));

    // Find the AI node
    const aiNode = nodes.find(n => n.id === nodeId);
    if (!aiNode) return;

    try {
      // Simulate AI response (in real app, this would come from node's onSubmit)
      const aiResponse = `Simulated AI response to: "${value}"`;
      
      // Store the response
      setAiResponses(prev => ({ ...prev, [nodeId]: aiResponse }));
      
      // Add AI response message
      addBotMessage({
        type: 'ai',
        content: aiResponse,
        nodeId,
        timestamp: new Date().toLocaleTimeString()
      });

      // Proceed to next node
      proceedToNextNode(nodeId, { input: value, response: aiResponse });
    } catch (error) {
      addSystemMessage(`AI error: ${error.message}`);
    }
  };

  // Reset conversation when flow changes
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
    // if (node.type === 'aiinput') {
    //   message.inputConfig = {
    //     placeholder: node.data.placeholder || 'Type your answer...',
    //     buttonText: node.data.buttonText || 'Send'

    //   };
    // }
    if (node.type === 'singleInput') {
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
// In your ChatbotPreview component

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
    <div className="w-3/7 p-5 border-l overflow-y-auto transition-colors duration-300"
         style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text)' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chatbot Preview</h2>
        <button 
          onClick={resetConversation}
          className="text-sm px-3 py-1 bg-blue-500 text-white rounded flex items-center gap-1"
        >
          <FiRefreshCw size={14} /> Restart
        </button>
      </div>
      
      <div className="bg-white p-4 rounded shadow" style={{ minHeight: '200px' }}>
        <div className="mb-4 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="font-bold">Chatbot</div>
          <div className="text-xs text-gray-500">Today at {new Date().toLocaleTimeString()}</div>
        </div>
        
        <div className="space-y-3">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="mb-1 text-xs text-gray-500">
              {msg.type === 'bot' ? 'Bot' : 
               msg.type === 'ai' ? 'AI' : 
               msg.type === 'user' ? 'You' : 'System'}
            </div>
            <div className={`p-3 rounded-lg max-w-[80%] ${
              msg.type === 'bot' ? 'bg-gray-100' : 
              msg.type === 'ai' ? 'bg-purple-100' :
              msg.type === 'user' ? 'bg-blue-100' : 
              'bg-gray-200'
            }`}>
                {msg.content}
                
                {msg.options && msg.type === 'bot' && (
                  <div className="mt-2 space-y-1">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionSelect(msg.nodeId, opt, i)}
                        className="block w-full text-left text-sm p-2 hover:bg-gray-200 rounded cursor-pointer border border-gray-300"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                    {msg.inputConfig && msg.type === 'bot' && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSingleInputSubmit(msg.nodeId, inputValues[msg.nodeId] || '');
                    }}
                    className="mt-2 flex"
                  >
                    <input
                      type="text"
                      value={inputValues[msg.nodeId] || ''}
                      onChange={(e) => setInputValues(prev => ({
                        ...prev,
                        [msg.nodeId]: e.target.value
                      }))}
                      placeholder={msg.inputConfig.placeholder}
                      className="flex-1 p-2 w-40 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <FiSend className="mr-1" /> 
                    </button>
                  </form>
                )}
                
                {msg.fields && msg.type === 'bot' && (
                  <div className="mt-2 space-y-2">
                    {msg.fields.map((field, i) => (
                      <div key={i} className="text-sm">
                        <label className="block text-gray-700 mb-1">{field.label}</label>
                        <input
                          type={field.type || 'text'}
                          placeholder={field.label}
                          className="w-full p-2 border border-gray-300 rounded"
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
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Submit
                    </button>
                  </div>
                )}
 {msg.nodeType === 'aiinput' && msg.type === 'bot' && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAiSubmit(msg.nodeId, inputValues[msg.nodeId] || '');
                  }}
                  className="mt-2 flex"
                >
                  <input
                    type="text"
                    value={inputValues[msg.nodeId] || ''}
                    onChange={(e) => setInputValues(prev => ({
                      ...prev,
                      [msg.nodeId]: e.target.value
                    }))}
                    placeholder="Type your message.."
                    className="flex-1 p-2 w-40 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  <button
                    type="submit"
                    className="p-2 bg-green-500 text-white rounded-r-lg hover:bg-green-600 transition-colors"
                  >
                    <FiSend />
                  </button>
                </form>
              )}

              {/* Show AI response if available */}
              {msg.type === 'ai' && aiResponses[msg.nodeId] && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium text-xs text-gray-500 mb-1">AI Response:</div>
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