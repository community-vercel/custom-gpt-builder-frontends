'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiRefreshCw, FiInfo } from 'react-icons/fi';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';

// Utility to format timestamps
const formatTimestamp = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatbotPreview = ({ nodes = [], edges = [], embedded = false, theme = 'light' }) => {
  const [conversation, setConversation] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [formData, setFormData] = useState({});
  const [currentPath, setCurrentPath] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [aiResponses, setAiResponses] = useState({});
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversation]);

  // Reset conversation when nodes or edges change
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
    setVisitedNodes(new Set());
    startConversation();
  };

  const startConversation = () => {
    const startingNodes = nodes.filter(node => !edges.some(edge => edge.target === node.id));
    if (startingNodes.length > 0) {
      processNode(startingNodes[0]);
    } else {
      addSystemMessage('No starting node found. Please configure the chatbot flow.');
    }
  };

  const processNode = (node) => {
    if (!node || visitedNodes.has(node.id)) {
      addSystemMessage('Conversation paused to prevent looping.');
      return;
    }

    setVisitedNodes(prev => new Set([...prev, node.id]));
    setCurrentPath(prev => [...prev, node.id]);

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
    const message = {
      id: crypto.randomUUID(),
      type: 'bot',
      content: node.data.label || getDefaultMessage(node.type),
      nodeType: node.type,
      nodeId: node.id,
      timestamp: formatTimestamp(),
    };

    if (node.type === 'custom' && node.data.options) {
      message.options = node.data.options;
    }

    if (node.type === 'form' && node.data.fields) {
      message.fields = node.data.fields.map(field => ({
        ...field,
        options: field.type === 'select' ? field.options || [] : undefined,
      }));
    }

    if (node.type === 'singleInput' || node.type === 'aiinput') {
      message.inputConfig = {
        placeholder: node.data.placeholder || 'Enter your response...',
        buttonText: node.data.buttonText || 'Submit',
      };
    }

    setConversation(prev => [...prev, message]);
  };

  const addUserMessage = (content) => {
    setConversation(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'user',
        content,
        timestamp: formatTimestamp(),
      },
    ]);
  };

  const addSystemMessage = (content) => {
    setConversation(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'system',
        content,
        timestamp: formatTimestamp(),
      },
    ]);
  };

  const handleOptionSelect = (nodeId, option, optionIndex) => {
    setSelectedOptions(prev => ({ ...prev, [nodeId]: option }));
    addUserMessage(option);

    const edge = edges.find(e => e.source === nodeId && e.sourceHandle === `option-${optionIndex}`);
    if (edge) {
      const nextNode = nodes.find(n => n.id === edge.target);
      setTimeout(() => processNode(nextNode, option), 500);
    } else {
      addSystemMessage('No further options available.');
    }
  };

  const handleFormSubmit = (nodeId, data) => {
    if (!data || Object.entries(data).some(([key, val]) => !val && formData[nodeId]?.[key]?.required)) {
      addSystemMessage('Please complete all required fields.');
      return;
    }
    setFormData(prev => ({ ...prev, [nodeId]: data }));
    addUserMessage('Form submitted successfully');
    proceedToNextNode(nodeId, data);
  };

  const handleSingleInputSubmit = (nodeId, value) => {
    if (!value.trim()) {
      addSystemMessage('Input cannot be empty.');
      return;
    }

    setInputValues(prev => ({ ...prev, [nodeId]: value }));
    addUserMessage(value);
    proceedToNextNode(nodeId, value);
  };

  const handleAiSubmit = async (nodeId, value) => {
    if (!value.trim()) {
      addSystemMessage('Input cannot be empty.');
      return;
    }

    setIsLoading(true);
    addUserMessage(value);
    setInputValues(prev => ({ ...prev, [nodeId]: value }));

    const aiNode = nodes.find(n => n.id === nodeId);
    if (!aiNode) {
      addSystemMessage('AI configuration not found.');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate AI response (replace with actual API call)
      const aiResponse = `AI response to: "${value}"`;
      setAiResponses(prev => ({ ...prev, [nodeId]: aiResponse }));

      addBotMessage({
        id: crypto.randomUUID(),
        type: 'ai',
        content: aiResponse,
        nodeId,
        timestamp: formatTimestamp(),
      });

      proceedToNextNode(nodeId, { input: value, response: aiResponse });
    } catch (error) {
      addSystemMessage(`AI processing error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToNextNode = (nodeId, data) => {
    const edge = edges.find(e => e.source === nodeId);
    if (edge) {
      const nextNode = nodes.find(n => n.id === edge.target);
      if (nextNode && !visitedNodes.has(nextNode.id)) {
        setTimeout(() => processNode(nextNode, data), 500);
      } else {
        addSystemMessage('Conversation paused to prevent looping.');
      }
    } else {
      addSystemMessage('Conversation completed.');
    }
  };

  const processCondition = (node) => {
    const randomChoice = Math.random() > 0.5 ? 'yes' : 'no';
    const edge = edges.find(e => e.source === node.id && e.sourceHandle === randomChoice);

    addSystemMessage(`Condition evaluated: ${randomChoice.toUpperCase()}`);

    if (edge) {
      const nextNode = nodes.find(n => n.id === edge.target);
      setTimeout(() => processNode(nextNode), 500);
    } else {
      addSystemMessage('No valid path for condition.');
    }
  };

  const processWebhook = async (node) => {
    setIsLoading(true);
    addSystemMessage(`Executing webhook: ${node.data.method} ${node.data.url}`);
    // Simulate webhook call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async call
      proceedToNextNode(node.id);
    } catch (error) {
      addSystemMessage(`Webhook error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const processDefault = (node) => {
    proceedToNextNode(node.id);
  };

  const getDefaultMessage = (nodeType) => {
    const messages = {
      text: 'Welcome! How may I assist you today?',
      condition: 'Processing condition...',
      webhook: 'Connecting to service...',
      form: 'Please complete the form below:',
      singleInput: 'Please provide your input:',
      aiinput: 'Please share your query:',
      default: 'Hello! How can I help you?',
    };
    return messages[nodeType] || messages.default;
  };

  return (
    <div
      className={classNames(
        'w-full max-w-md mx-auto p-6 rounded-3xl shadow-2xl transition-all duration-500',
        {
          'bg-gradient-to-br from-white to-gray-50 text-gray-900': theme === 'light',
          'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100': theme === 'dark',
        }
      )}
      role="region"
      aria-label="Chatbot Interface"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Intelligent Assistant</h2>
        <button
          onClick={resetConversation}
          className={classNames(
            'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:scale-105',
            {
              'bg-blue-600 text-white hover:bg-blue-700': theme === 'light',
              'bg-blue-500 text-white hover:bg-blue-600': theme === 'dark',
            }
          )}
          aria-label="Restart conversation"
        >
          <FiRefreshCw size={18} />
          Restart
        </button>
      </div>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className={classNames(
          'relative p-4 rounded-xl min-h-[450px] max-h-[650px] overflow-y-auto scrollbar-thin',
          {
            'bg-gray-100 scrollbar-thumb-gray-400': theme === 'light',
            'bg-gray-900 scrollbar-thumb-gray-600': theme === 'dark',
          }
        )}
      >
        {/* Sticky Header */}
        <div
          className={classNames(
            'sticky top-0 p-4 border-b z-10',
            {
              'bg-gray-100 border-gray-200': theme === 'light',
              'bg-gray-900 border-gray-700': theme === 'dark',
            }
          )}
        >
          <div className="text-sm font-semibold flex items-center gap-2">
            <FiInfo size={16} />
            Intelligent Assistant
          </div>
          <div className="text-xs text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} at {formatTimestamp()}
          </div>
        </div>

        {/* Loading Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiRefreshCw className="animate-spin" size={16} />
                Processing...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="space-y-5 mt-5">
          <AnimatePresence>
            {conversation.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={classNames('flex flex-col', {
                  'items-end': msg.type === 'user',
                  'items-start': msg.type !== 'user',
                })}
              >
                <div
                  className={classNames('text-xs mb-2', {
                    'text-gray-600': theme === 'light',
                    'text-gray-400': theme === 'dark',
                  })}
                >
                  {msg.type === 'bot'
                    ? 'Assistant'
                    : msg.type === 'ai'
                    ? 'AI Response'
                    : msg.type === 'user'
                    ? 'You'
                    : 'System'}
                  <span className="ml-2 text-gray-500">({msg.timestamp})</span>
                </div>
                <div
                  className={classNames(
                    'p-4 rounded-xl max-w-[75%] shadow-lg transition-all duration-300',
                    {
                      'bg-gradient-to-br from-blue-100 to-blue-50 text-gray-900': msg.type === 'bot' && theme === 'light',
                      'bg-gradient-to-br from-gray-700 to-gray-600 text-gray-100': msg.type === 'bot' && theme === 'dark',
                      'bg-purple-100 text-gray-900': msg.type === 'ai' && theme === 'light',
                      'bg-purple-900 text-gray-100': msg.type === 'ai' && theme === 'dark',
                      'bg-blue-600 text-white': msg.type === 'user' && theme === 'light',
                      'bg-blue-500 text-white': msg.type === 'user' && theme === 'dark',
                      'bg-gray-200 text-gray-900': msg.type === 'system' && theme === 'light',
                      'bg-gray-600 text-gray-100': msg.type === 'system' && theme === 'dark',
                    }
                  )}
                >
                  <div className="text-sm leading-relaxed">{msg.content}</div>

                  {/* Options */}
                  {msg.options && msg.type === 'bot' && (
                    <div className="mt-4 space-y-2">
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionSelect(msg.nodeId, opt, i)}
                          className={classNames(
                            'block w-full text-left text-sm p-3 border rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500',
                            {
                              'bg-white border-gray-300 hover:bg-gray-100': theme === 'light',
                              'bg-gray-700 border-gray-600 hover:bg-gray-600': theme === 'dark',
                            }
                          )}
                          aria-label={`Select option ${opt}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input Field */}
                  {msg.inputConfig && msg.type === 'bot' && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (msg.nodeType === 'aiinput') {
                          handleAiSubmit(msg.nodeId, inputValues[msg.nodeId] || '');
                        } else {
                          handleSingleInputSubmit(msg.nodeId, inputValues[msg.nodeId] || '');
                        }
                      }}
                      className="mt-4 flex gap-2"
                    >
                      <input
                        type="text"
                        value={inputValues[msg.nodeId] || ''}
                        onChange={(e) => setInputValues(prev => ({ ...prev, [msg.nodeId]: e.target.value }))}
                        placeholder={msg.inputConfig.placeholder}
                        className={classNames(
                          'flex-1 p-3 text-sm border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200',
                          {
                            'bg-white border-gray-300 text-gray-900': theme === 'light',
                            'bg-gray-700 border-gray-600 text-gray-100': theme === 'dark',
                          }
                        )}
                        aria-label={msg.inputConfig.placeholder}
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={classNames(
                          'p-3 rounded-r-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105',
                          {
                            'bg-blue-600 hover:bg-blue-700': msg.nodeType !== 'aiinput' && theme === 'light',
                            'bg-blue-500 hover:bg-blue-600': msg.nodeType !== 'aiinput' && theme === 'dark',
                            'bg-green-600 hover:bg-green-700': msg.nodeType === 'aiinput' && theme === 'light',
                            'bg-green-500 hover:bg-green-600': msg.nodeType === 'aiinput' && theme === 'dark',
                            'opacity-50 cursor-not-allowed': isLoading,
                          }
                        )}
                        aria-label="Submit input"
                      >
                        <FiSend size={18} />
                      </button>
                    </form>
                  )}

                  {/* Form Fields */}
                  {msg.fields && msg.type === 'bot' && (
                    <div className="mt-4 space-y-3">
                      {msg.fields.map((field, i) => (
                        <div key={i} className="text-sm">
                          <label
                            className={classNames('block mb-1 font-medium', {
                              'text-gray-700': theme === 'light',
                              'text-gray-300': theme === 'dark',
                            })}
                            htmlFor={`${msg.nodeId}-${field.key}`}
                          >
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.type === 'select' ? (
                            <select
                              id={`${msg.nodeId}-${field.key}`}
                              value={formData[msg.nodeId]?.[field.key] || ''}
                              onChange={(e) => {
                                const data = { ...formData[msg.nodeId], [field.key]: e.target.value };
                                setFormData(prev => ({ ...prev, [msg.nodeId]: data }));
                              }}
                              className={classNames(
                                'w-full p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200',
                                {
                                  'bg-white border-gray-300 text-gray-900': theme === 'light',
                                  'bg-gray-700 border-gray-600 text-gray-100': theme === 'dark',
                                }
                              )}
                              required={field.required}
                              aria-label={field.label}
                              disabled={isLoading}
                            >
                              <option value="" disabled>
                                Select an option
                              </option>
                              {field.options?.map((opt, idx) => (
                                <option key={idx} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type || 'text'}
                              id={`${msg.nodeId}-${field.key}`}
                              placeholder={field.label}
                              value={formData[msg.nodeId]?.[field.key] || ''}
                              onChange={(e) => {
                                const data = { ...formData[msg.nodeId], [field.key]: e.target.value };
                                setFormData(prev => ({ ...prev, [msg.nodeId]: data }));
                              }}
                              className={classNames(
                                'w-full p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200',
                                {
                                  'bg-white border-gray-300 text-gray-900': theme === 'light',
                                  'bg-gray-700 border-gray-600 text-gray-100': theme === 'dark',
                                }
                              )}
                              required={field.required}
                              aria-label={field.label}
                              disabled={isLoading}
                            />
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => handleFormSubmit(msg.nodeId, formData[msg.nodeId])}
                        disabled={isLoading}
                        className={classNames(
                          'mt-3 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105',
                          {
                            'bg-blue-600 text-white hover:bg-blue-700': theme === 'light',
                            'bg-blue-500 text-white hover:bg-blue-600': theme === 'dark',
                            'opacity-50 cursor-not-allowed': isLoading,
                          }
                        )}
                        aria-label="Submit form"
                      >
                        Submit
                      </button>
                    </div>
                  )}

                  {/* AI Response */}
                  {msg.type === 'ai' && aiResponses[msg.nodeId] && (
                    <div
                      className={classNames(
                        'mt-3 p-3 rounded-lg text-sm',
                        {
                          'bg-purple-50 text-gray-900': theme === 'light',
                          'bg-purple-800 text-gray-100': theme === 'dark',
                        }
                      )}
                    >
                      <div className="font-semibold text-xs mb-1">AI Response:</div>
                      <div>{aiResponses[msg.nodeId]}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

ChatbotPreview.propTypes = {
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string,
      data: PropTypes.shape({
        label: PropTypes.string,
        options: PropTypes.arrayOf(PropTypes.string),
        fields: PropTypes.arrayOf(
          PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            type: PropTypes.string,
            required: PropTypes.bool,
            options: PropTypes.arrayOf(PropTypes.string),
          })
        ),
        placeholder: PropTypes.string,
        buttonText: PropTypes.string,
        method: PropTypes.string,
        url: PropTypes.string,
      }).isRequired,
    })
  ),
  edges: PropTypes.arrayOf(
    PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired,
      sourceHandle: PropTypes.string,
    })
  ),
  embedded: PropTypes.bool,
  theme: PropTypes.oneOf(['light', 'dark']),
};

export default ChatbotPreview