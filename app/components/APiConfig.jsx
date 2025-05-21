'use client';
import React, { useState,useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import { saveApiConfig,fetchApiConfig } from '../../store/apiConfigSlice';

const ApiConfigModal = ({ isOpen, onClose, apiConfig, onSave }) => {
  const [config, setConfig] = useState(apiConfig || {
    openai: { apiKey: '', model: 'gpt-3.5-turbo' },
    deepseek: { apiKey: '', model: 'deepseek-chat' },
    gemini: { apiKey: '', model: 'gemini-pro' },
    chatbot: { provider: '' },
    provider: 'openai'
  });  const [activeTab, setActiveTab] = useState(apiConfig.provider || 'openai');
  const dispatch = useDispatch();
  const savedConfig = useSelector((state) => state.apiConfig?.config); // no fallback
  console.log("savedConfig",savedConfig)

  console.log("savedConfig",savedConfig)
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    }
  });


  useEffect(() => {
    if (isOpen && session?.user?.id) {
      dispatch(fetchApiConfig(session.user.id));
    }
  }, [isOpen, session?.user?.id]);
  useEffect(() => {
    if (isOpen && savedConfig) {
      setConfig(savedConfig);
      setActiveTab(savedConfig.provider || 'openai');
    }
  }, [isOpen, savedConfig]);
  
  if (!isOpen) return null;
  const handleChange = (provider, key, value) => {
    setConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onSave({
      ...config,
      provider: activeTab
    });
    dispatch(saveApiConfig({
      userId: session?.user?.id,
      config: {
        ...config,
        provider: activeTab
      }
    }));
    onClose();
  };


  return (
<div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center">
<div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">API Configuration</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          {['openai', 'deepseek', 'gemini', 'chatbot'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 capitalize ${
                activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'chatbot' ? 'AI Chatbot' : tab}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        {activeTab === 'openai' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={config?.openai?.apiKey || ''}
              onChange={(e) => handleChange('openai', 'apiKey', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="sk-...your-api-key"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <select
              value={config?.openai?.model}
              onChange={(e) => handleChange('openai', 'model', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
          </div>
        )}

        {activeTab === 'deepseek' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={config?.deepseek.apiKey}
              onChange={(e) => handleChange('deepseek', 'apiKey', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="your-deepseek-api-key"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <select
              value={config?.deepseek.model ?? ''}
              onChange={(e) => handleChange('deepseek', 'model', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="deepseek-chat">DeepSeek Chat</option>
              <option value="deepseek-coder">DeepSeek Coder</option>
            </select>
          </div>
        )}

        {activeTab === 'gemini' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={config?.gemini.apiKey ?? ''}
              onChange={(e) => handleChange('gemini', 'apiKey', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="your-gemini-api-key"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <select
              value={config?.gemini.model}
              onChange={(e) => handleChange('gemini', 'model', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="gemini-pro">Gemini Pro</option>
              <option value="gemini-ultra">Gemini Ultra</option>
            </select>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select AI Chatbot</label>
            <select
              value={config?.chatbot?.provider || ''}
              onChange={(e) => handleChange('chatbot', 'provider', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">-- Select Chatbot --</option>
              <option value="openai">OpenAI (GPT)</option>
              <option value="deepseek">DeepSeek</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigModal;