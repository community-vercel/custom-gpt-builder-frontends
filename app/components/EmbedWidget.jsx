// EmbedWidget.js
'use client';

import React, { useState, useEffect } from 'react';
import { FiCopy, FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

const EmbedWidget = ({ nodes, edges, flowId, websiteDomain }) => {
  const [embedType, setEmbedType] = useState('js');
  const [position, setPosition] = useState('bottom-right');
  const [customTheme, setCustomTheme] = useState({
    primaryColor: '#6366f1',
    secondaryColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isCustomizing, setIsCustomizing] = useState(true);
  const flowState = useSelector((state) => state.flowBuilder);
  const { data: session } = useSession();

  // Find the starting node
  useEffect(() => {
    if (previewMode && nodes.length > 0) {
      const incomingEdges = edges.reduce((acc, edge) => {
        acc[edge.target] = true;
        return acc;
      }, {});
      const startNode = nodes.find((node) => !incomingEdges[node.id]) || nodes[0];
      if (startNode) {
        setCurrentNodeId(startNode.id);
        setChatHistory([{ node: startNode, userInput: null }]);
      }
    } else {
      setCurrentNodeId(null);
      setChatHistory([]);
    }
  }, [previewMode, nodes, edges]);

  // Generate JavaScript snippet
  const generateJsSnippet = () => {
    const script = `
      <script src="http://localhost:5000/api/chatbot/script.js"></script>
      <script>
        window.ChatbotConfig = {
          flowId: "${flowId || 'your-flow-id'}",
          userId: "${session?.user?.id || 'your-user-id'}",
          websiteDomain: "${websiteDomain || 'your-website.com'}",
          position: "${position}",
          theme: {
            primary: "${customTheme.primaryColor}",
            secondary: "${customTheme.secondaryColor}",
            background: "${customTheme.backgroundColor}",
            text: "${customTheme.textColor}"
          }
        };
        window.initChatbot();
      </script>
    `;
    return script.trim();
  };

  // Generate iframe code
  const generateIframeCode = () => {
    return `
      <iframe
        src="http://localhost:5000/api/chatbot/${flowId || 'your-flow-id'}/${session?.user?.id || 'your-user-id'}?domain=${encodeURIComponent(websiteDomain || 'your-website.com')}"
        style="width: 400px; height: 600px; border: none; position: fixed; ${position.replace('-', ': ')}: 20px;"
        allowtransparency="true"
      ></iframe>
    `;
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Code copied to clipboard!', {
        style: {
          background: customTheme.backgroundColor,
          color: customTheme.textColor,
          border: `1px solid ${customTheme.primaryColor}`,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      });
    }).catch(() => {
      toast.error('Failed to copy code.', {
        style: {
          background: customTheme.backgroundColor,
          color: customTheme.textColor,
          border: `1px solid #ef4444`,
          borderRadius: '8px',
        },
      });
    });
  };

  // Handle theme changes
  const handleThemeChange = (key, value) => {
    setCustomTheme((prev) => ({ ...prev, [key]: value }));
  };

  // Handle user interaction
  const handleInteraction = (node, userInput, optionIndex = null) => {
    let nextEdge = null;
    if (node.type === 'custom' && optionIndex !== null) {
      const sourceHandle = `option-${optionIndex}`;
      nextEdge = edges.find((edge) => edge.source === node.id && edge.sourceHandle === sourceHandle);
    } else {
      nextEdge = edges.find((edge) => edge.source === node.id);
    }

    if (nextEdge) {
      const nextNode = nodes.find((n) => n.id === nextEdge.target);
      if (nextNode) {
        setCurrentNodeId(nextNode.id);
        setChatHistory((prev) => [...prev, { node: nextNode, userInput }]);
      }
    }
  };

  // Preview styles
  const previewStyles = {
    width: '100%',
    maxWidth: '380px',
    height: '400px',
    backgroundColor: customTheme.backgroundColor,
    color: customTheme.textColor,
    border: `2px solid ${customTheme.primaryColor}`,
    borderRadius: '20px',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
    position: 'relative',
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    margin: '0 auto',
    transition: 'all 0.4s ease-in-out',
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-indigo-100 rounded-2xl shadow-2xl backdrop-blur-md max-h-[80vh] overflow-y-auto">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-amber-500 bg-clip-text text-transparent text-center md:text-left">
          Embed Your Chatbot {websiteDomain && `on : ${websiteDomain}`}
        </h3>
        <div className="flex gap-2 bg-white/30 p-1 rounded-lg shadow-sm">
          <button
            className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center gap-2 ${
              embedType === 'js'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setEmbedType('js')}
          >
            JavaScript
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center gap-2 ${
              embedType === 'iframe'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setEmbedType('iframe')}
          >
            Iframe
          </button>
        </div>
      </div>

      {/* Code Block */}
      <div className="relative group mb-6">
        <CodeBlock
          code={embedType === 'js' ? generateJsSnippet() : generateIframeCode()}
          language={embedType === 'js' ? 'javascript' : 'html'}
        />
        <button
          className="absolute top-3 right-3 p-2 bg-indigo-500 text-white rounded-lg hover:bg-amber-500 transition-all duration-300 shadow-md hover:scale-110"
          onClick={() => copyToClipboard(embedType === 'js' ? generateJsSnippet() : generateIframeCode())}
          title="Copy to Clipboard"
          aria-label="Copy code to clipboard"
        >
          <FiCopy className="w-4 h-4" />
        </button>
      </div>

      {/* Customization Options */}
      <div className="bg-white/50 p-4 rounded-xl border border-gray-200/50 backdrop-blur-sm mb-6">
        <div
          className="flex items-center justify-between cursor-pointer py-2"
          onClick={() => setIsCustomizing(!isCustomizing)}
        >
          <h4 className="text-lg font-semibold text-gray-800">Customize Appearance</h4>
          {isCustomizing ? (
            <FiChevronUp className="w-5 h-5 text-gray-600 transition-transform duration-300" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-gray-600 transition-transform duration-300" />
          )}
        </div>

        {isCustomizing && (
          <div className="space-y-4 pt-4 animate-slide-in">
            {/* Position Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chatbot Position</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['bottom-right', 'bottom-left', 'top-right', 'top-left'].map((pos) => (
                  <button
                    key={pos}
                    className={`p-2 rounded-lg border transition-all duration-300 ${
                      position === pos
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                        : 'bg-white border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setPosition(pos)}
                  >
                    {pos.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Customization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Primary', key: 'primaryColor' },
                  { label: 'Secondary', key: 'secondaryColor' },
                  { label: 'Background', key: 'backgroundColor' },
                  { label: 'Text', key: 'textColor' },
                ].map(({ label, key }) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customTheme[key]}
                        onChange={(e) => handleThemeChange(key, e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 hover:scale-110 transition-transform duration-300"
                      />
                      <input
                        type="text"
                        value={customTheme[key]}
                        onChange={(e) => handleThemeChange(key, e.target.value)}
                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-gray-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="flex flex-col items-center gap-4 mt-6">
        <button
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-amber-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:scale-105"
          onClick={() => setPreviewMode(!previewMode)}
        >
          <FiEye className="w-5 h-5" />
          <span>{previewMode ? 'Hide Live Preview' : 'Show Live Preview'}</span>
        </button>

        {previewMode && (
          <div className="w-full flex justify-center mt-4 pb-6">
            <div style={previewStyles} className="animate-float max-h-[40vh] sm:max-h-[50vh] overflow-hidden">
              <iframe
                src={`http://localhost:5000/api/chatbot/${flowId}/${session?.user?.id}?domain=${encodeURIComponent(websiteDomain || 'your-website.com')}&preview=true`}
                className="w-full h-full rounded-2xl"
                allowtransparency="true"
                title="Chatbot preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced CodeBlock Component
const CodeBlock = ({ code, language }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  return (
    <div className="relative">
      <pre className="p-4 rounded-lg overflow-auto text-sm max-h-96 bg-white border border-gray-200 shadow-inner">
        <code className={`language-${language} text-gray-800`}>{code}</code>
      </pre>
    </div>
  );
};

export default EmbedWidget;