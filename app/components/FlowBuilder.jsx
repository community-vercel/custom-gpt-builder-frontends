'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {useNodesState,useEdgesState,addEdge,MiniMap,Controls,Background,Panel} from 'reactflow';
import CustomNode from './CustomNode';
import TextNode from './TextNode';
import WebhookNode from './WebhookNode';
import FormNode from './FormNode'; // ← new
import ConditionNode from './ConditionNode';
import SingleInputFormNode from './SingleInputNode';
import SingleInputApi from './SingleAPi';
import 'reactflow/dist/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { setNodes as setStoreNodes, updateNode, addNode, clearFlow,setWebsiteDomain, // Make sure this is included in the exports
 } from '../../store/flowBuilderSlice';
import { applyNodeChanges } from 'reactflow';
import { useReactFlow } from 'reactflow';
import { AiFillAliwangwang } from "react-icons/ai";
import { setSmtpConfig } from '../../store/smtpSlice';
import { setapiConfig } from '../..//store/apiConfigSlice';
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { saveFlow, loadFlow, loadFlows, updateFlow } from '../../store/flowBuilderSlice';
import { setEdges as setEdgesAction } from '../../store/flowBuilderSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import {FiMessageCircle,FiZap,FiLink,FiTrash2,FiSave,FiSun,FiMoon,FiDroplet,FiSend,FiSettings,FiCode} from 'react-icons/fi';
import { BsBoxes, BsPalette } from 'react-icons/bs';
import ChatbotPreview from './ChatbotPreview';
import ApiConfigModal from './APiConfig';
import SmtpModal from './Smtp';
import { saveApiConfig, fetchApiConfig } from '../../store/apiConfigSlice';
import { fetchSmtpConfig } from '../../store/smtpSlice';
import { FiFolder, FiPlus } from 'react-icons/fi';
import FlowSelector from './FlowSelector';
import EmbedWidget from './EmbedWidget';
import { FaInfo } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';


const nodeTypes = {
  custom: CustomNode,
  text: TextNode,
  webhook: WebhookNode,
  form: FormNode,
  condition: ConditionNode,
  singleInput: SingleInputFormNode,
  aiinput: SingleInputApi,
};


const themes = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      secondary: '#f59e0b',
      success: '#10b981',
      danger: '#ef4444',
      background: '#f9fafb',
      sidebar: '#ffffff',
      text: '#111827',
      border: '#e5e7eb',
    },
    icon: <FiSun className="text-yellow-500" />
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#fbbf24',
      success: '#34d399',
      danger: '#f87171',
      background: '#1f2937',
      sidebar: '#111827',
      text: '#f3f4f6',
      border: '#374151',
    },
    icon: <FiMoon className="text-indigo-300" />
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#06b6d4',
      secondary: '#0ea5e9',
      success: '#14b8a6',
      danger: '#f43f5e',
      background: '#f0f9ff',
      sidebar: '#e0f2fe',
      text: '#082f49',
      border: '#bae6fd',
    },
    icon: <FiDroplet className="text-cyan-500" />
  }
};

export default function FlowBuilder() {
  const dispatch = useDispatch();
  const flowState = useSelector(state => state.flowBuilder);
  const { data: session, status } = useSession({
  });
  const [websiteDomain, setWebsiteDomainInput] = useState(''); // New state for website domain
  const [domainError, setDomainError] = useState(''); // New state for domain validation
 const [customTheme, setCustomTheme] = useState({
    primaryColor: '#6366f1',
    secondaryColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
  });
  const [currentTheme, setCurrentTheme] = useState('light');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { project } = useReactFlow();
  const [showApiModal, setShowApiModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [smtpDetails, setSmtpDetails] = useState(null);
  const savedConfig = useSelector((state) => state.apiConfig.config || {});
  const [flowName, setFlowName] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nameError, setNameError] = useState('');

  const searchParams = useSearchParams();
  const flowId = searchParams.get('flow'); 
  const [showEmbedModal, setShowEmbedModal] = useState(false);
console.log('FlowBuilder mounted with flowId:', flowState.currentFlowId); // Debugging log
  useEffect(() => {
    if (session?.user?.id && flowId) {
      dispatch(loadFlow({ userId: session.user.id, flowId }));
    }
  }, [session?.user?.id, flowId, dispatch]);
  
  useEffect(() => {
    if (flowState.nodes.length > 0) {
      setNodes(flowState.nodes);
    }
    if (flowState.edges.length > 0) {
      const formattedEdges = flowState.edges.map(edge => ({
        ...edge,
        // Ensure all required edge properties exist
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        type: edge.type || 'default',
        animated: edge.animated !== undefined ? edge.animated : true
      }));
      setEdges(formattedEdges);
    }
    setFlowName(flowState.flowName || '');
    setWebsiteDomainInput(flowState.websiteDomain || ''); // Update websiteDomain

  }, [flowState.nodes, flowState.edges, flowState.websiteDomain, flowState.flowName]);
  const validateDomain = (domain) => {
    const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  useEffect(() => {
    if (nodes.length > 0 && edges.length > 0) {
      const validEdges = edges.filter(edge => {
        const sourceExists = nodes.some(n => n.id === edge.source);
        const targetExists = nodes.some(n => n.id === edge.target);
        return sourceExists && targetExists;
      });

      if (validEdges.length !== edges.length) {
        setEdges(validEdges);
        dispatch(setEdgesAction(validEdges));
      }
    }
  }, [nodes, edges]);
const handleSaveFlows = async () => {
  if (!session?.user?.id) {
    toast.error('User not authenticated', { /* ... */ });
    return;
  }

  // Validate inputs
  if (!flowName.trim()) {
    setNameError('Flow name is required');
    return;
  }
  if (!websiteDomain.trim()) {
    setDomainError('Website domain is required');
    return;
  }
  if (!validateDomain(websiteDomain)) {
    setDomainError('Invalid website domain');
    return;
  }

  setNameError('');
  setDomainError('');


  try {
    let result;
    if (flowState.currentFlowId || flowId) {
      result = await dispatch(
        updateFlow({
          userId: session.user.id,
          flowId: flowState.currentFlowId || flowId,
          nodes,
          edges,
          websiteDomain,
          flowName,
        })
      ).unwrap();
    } else {
      result = await dispatch(
        saveFlow({
          userId: session.user.id,
          nodes,
          edges,
          flowName: flowName ,
          websiteDomain,
        })
      ).unwrap();
    }
    

    toast.success('Flow saved successfully!', {
      style: {
        background: customTheme.backgroundColor || '#f8f9fa',
        color: customTheme.textColor || '#212529',
        border: `1px solid ${customTheme.primaryColor || '#007bff'}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    });
      dispatch(setFlowName(flowName));

  if (typeof setWebsiteDomain === 'function') {
      dispatch(setWebsiteDomain(websiteDomain));

    } else {
      console.error('setWebsiteDomain is not a function:', setWebsiteDomain);
    }

    
    // Debug embed modal conditions

    // Open embed modal if conditions are met
  
  } catch (error) {
    toast.error('Failed to save flow: ' + (error.message || 'Unknown error'), { /* ... */ });
  }
};


  // Update local state when Redux state changes
  useEffect(() => {
    setNodes(flowState.nodes);
    setEdges(flowState.edges);
  }, [flowState.nodes, flowState.edges]);


  useEffect(() => {
    if (session?.user?.id) {
      dispatch(fetchApiConfig(session.user.id)).then((res) => {
        if (res.payload) {
          setApiConfig(res.payload);
        }
      });

      dispatch(fetchSmtpConfig(session.user.id));
      dispatch(loadFlows(session.user.id));



    }
  }, [session?.user?.id, dispatch]);

  const handleSave = (config) => {
    dispatch(setSmtpConfig(config));
    setSmtpDetails(config); 
  };
  const [apiConfig, setApiConfig] = useState({
    provider: 'openai',
    openai: { apiKey: '', model: 'gpt-3.5-turbo' },
    deepseek: { apiKey: '', model: 'deepseek-chat' },
    gemini: { apiKey: '', model: 'gemini-pro' }
  });

  const handleApiConfigSave = (newConfig) => {
    console.log("new", newConfig)
    dispatch(setapiConfig(newConfig))
    setApiConfig(newConfig);

  };

  const onConnect = useCallback(
    (params) => {
      // Determine label and color based on handle ID
      let label = '';
      let stroke = '#999';

      if (params.sourceHandle === 'yes') {
        label = 'Yes';
        stroke = 'green';
      } else if (params.sourceHandle === 'no') {
        label = 'No';
        stroke = 'red';
      } else if (params.sourceHandle?.startsWith('option-')) {
        const optionIndex = params.sourceHandle.split('-')[1];
        const sourceNode = nodes.find((n) => n.id === params.source);
        label = sourceNode?.data?.options?.[optionIndex] || `Option ${optionIndex}`;
        stroke = '#007bff'; // blue for options
      }

      const newEdges = addEdge(
        {
          ...params,
          label,
          style: { stroke },
          animated: true,
          type: 'custom', // if you're using CustomEdge
        },
        edges
      );

      setEdges(newEdges);
      dispatch(setEdgesAction(newEdges));
    },
    [edges, nodes, dispatch]
  );
  

 
  useEffect(() => {
    // Only update local state if store nodes are different
    if (JSON.stringify(flowState.nodes) !== JSON.stringify(nodes)) {
      setNodes(flowState.nodes);
    }
    if (JSON.stringify(flowState.edges) !== JSON.stringify(edges)) {
      setEdges(flowState.edges);
    }
  }, [flowState.nodes, flowState.edges]);
  const theme = themes[currentTheme];

  const onNodesChangeHandler = useCallback(
    (changes) => {
      const nextNodes = applyNodeChanges(changes, nodes);
      setNodes(nextNodes);  // This updates local state

      // Check for position changes (not just dragging)
      const hasPositionUpdates = changes.some(
        change => change.type === 'position' && !change.dragging
      );

      if (hasPositionUpdates) {
        dispatch(setStoreNodes(nextNodes));  // Use renamed action here
      }
    },
    [nodes, dispatch]
  );; const onEdgesChangeHandler = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = project({ x: event.clientX, y: event.clientY });
      const id = crypto.randomUUID();

      const baseData = {
        label: type === 'aiinput' ? '' :
          type === 'condition' ? 'Condition' :
            type === 'webhook' ? 'Webhook' :
              type === 'form' ? 'Form' : 'Message',
        onChange: (value) => {
          dispatch(updateNode({ id, data: { label: value } }));
        }
      };

      const typeSpecificData = {
        aiinput: {
          placeholder: "Type your message..",
          apiConfig: {
            provider: 'openai',
            openai: { apiKey: '', model: 'gpt-3.5-turbo' },
            deepseek: { apiKey: '', model: 'deepseek-chat' },
            gemini: { apiKey: '', model: 'gemini-pro' }
          },
          onApiConfigChange: (newConfig) => {
            dispatch(updateNode({ id, data: { apiConfig: newConfig } }));
          },

          onSubmit: (data) => {
            console.log('AI interaction:', data);
            // In a real app, this would trigger the AI call
          }
        },





        // ... other node types
      };

      const newNode = {
        id,
        type,
        position,
        data: {
          ...baseData,
          ...(typeSpecificData[type] || {}),
          options: type === 'custom' ? ['Option1', 'Option2'] : undefined,

          url: type === 'webhook' ? 'https://example.com' : undefined,

          method: type === 'webhook' ? 'POST' : undefined,

          fields: type === 'form' ? [

            { label: 'Name', key: 'name', type: 'text', required: true },
            { label: 'Email', key: 'email', type: 'email', required: true },


          ] : undefined,

          onSubmit: (data) => {
            console.log('Form submitted:', data);
          },
          onFieldsChange: (fields) => {
            dispatch(updateNode({ id, data: { fields } }));
          },
        }
      };

      dispatch(addNode(newNode));
    },
    [dispatch, project]
  );
  const handleClearFlow = () => {
    dispatch(clearFlow());
  };

  const toggleThemePicker = () => {
    setShowThemePicker(!showThemePicker);
  };

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    setShowThemePicker(false);
  };

  // Apply theme styles
  const themeStyles = {
    '--primary': theme.colors.primary,
    '--secondary': theme.colors.secondary,
    '--success': theme.colors.success,
    '--danger': theme.colors.danger,
    '--background': theme.colors.background,
    '--sidebar': theme.colors.sidebar,
    '--text': theme.colors.text,
    '--border': theme.colors.border,
  };

  return (
    <div
      className="h-screen w-full flex font-sans transition-colors duration-300"
      style={themeStyles}
    >
      {/* Sidebar Components */}
      <div
        className="w-1/3 p-5 border-r overflow-y-auto shadow-sm transition-colors duration-300"
        style={{
          backgroundColor: 'var(--sidebar)',
          borderColor: 'var(--border)',
          color: 'var(--text)'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BsBoxes className="text-[var(--primary)] text-2xl" /> Components
          </h2>
          <button
            onClick={toggleThemePicker}
            className="p-2 rounded-full hover:bg-[var(--background)] transition-colors"
            title="Change theme"
          >
            <BsPalette className="text-[var(--primary)]" />
          </button>
        </div>

        {showThemePicker && (
          <div
            className="absolute left-4 mt-2 z-50 p-3 rounded-lg shadow-lg"
            style={{
              backgroundColor: 'var(--sidebar)',
              border: '1px solid var(--border)'
            }}
          >
            <h3 className="text-sm font-semibold mb-2">Select Theme</h3>
            <div className="flex gap-2">
              {Object.entries(themes).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => changeTheme(key)}
                  className={`p-2 rounded-md flex items-center gap-1 text-sm ${currentTheme === key ? 'ring-2 ring-[var(--primary)]' : ''}`}
                  style={{
                    backgroundColor: currentTheme === key ? 'var(--background)' : 'transparent',
                    color: 'var(--text)'
                  }}
                >
                  {config.icon}
                  {config.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">

          {/* Reusable node item */}
          {[
            {
              type: 'custom',
              icon: <FiZap className="text-[var(--secondary)] text-lg" />,
              label: 'Options',
              bg: `${theme.colors.secondary}20`,
            },
            {
              type: 'text',
              icon: <FiMessageCircle className="text-[var(--primary)] text-lg" />,
              label: 'Text Message',
              bg: `${theme.colors.primary}20`,
            },
            {
              type: 'webhook',
              icon: <FiLink className="text-[var(--success)] text-lg" />,
              label: 'Webhook',
              bg: `${theme.colors.success}20`,
            },
            {
              type: 'form',
              icon: <span className="text-lg">📝</span>,
              label: 'Form',
              bg: `${theme.colors.primary}20`,
            },
            {
              type: 'singleInput',
              icon: <FiSend className="text-green text-lg drop-shadow-sm" />,
              label: 'Single Input',
              bg: `${theme.colors.secondary}20`,
              pulse: true,
              textClass: 'text-blue-900 font-bold text-lg tracking-wide',
            },

            {
              type: 'condition',
              icon: <FiZap className="text-yellow-600 text-lg" />,
              label: 'Condition',
              bg: 'bg-yellow-100',
            },
          ].map(({ type, icon, label, bg, pulse, textClass }, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 rounded-xl border shadow-sm cursor-move transition-all duration-300 hover:shadow-lg hover:translate-x-1"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', type)}
            >
              <div
                className={`p-3 rounded-full ${bg} ${pulse ? 'animate-pulse shadow-md' : ''}`}
              >
                {icon}
              </div>
              <span className={textClass || 'font-medium'}>{label}</span>
            </div>
          ))}

          {/* AI Configuration Button */}
          {(
            apiConfig.chatbot?.provider !== '' &&
            (
              apiConfig.openai?.apiKey !== '' ||
              apiConfig.deepseek?.apiKey !== '' ||
              apiConfig.gemini?.apiKey !== ''
            )
          ) ? (
            <div
              className="p-4 mb-3 rounded-lg shadow-md hover:shadow-lg border cursor-move flex items-center gap-3 hover:translate-x-1"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'aiinput')}
            >
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 via-green-600 to-blue-700 shadow-md animate-pulse">
                <AiFillAliwangwang className="text-white text-2xl drop-shadow-sm" />
              </div>
              <span className="text-blue-900 font-bold text-lg tracking-wide">Ai Chat</span>
            </div>
          ) : (
            <div
              className="p-4 mb-3 rounded-lg shadow-md hover:shadow-lg border cursor-move flex items-center gap-3 hover:translate-x-1"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
              draggable

              onDragStart={(e) => {
                e.preventDefault();
                alert('Please configure AI first.');
              }}
            >
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 via-green-600 to-blue-700 shadow-md animate-pulse">
                <AiFillAliwangwang className="text-white text-2xl drop-shadow-sm" />
              </div>
              <span className="text-blue-900 font-bold text-lg tracking-wide">Ai Chat</span>

            </div>
          )}
          <div
            className="flex items-center gap-3 p-4 rounded-xl border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:translate-x-1"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <button
              onClick={() => setShowApiModal(true)}
              className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-full   transition"
            >
              <FiSettings className="text-lg text-yellow-800 hover:bg-yellow-200" />
              <span className="font-medium">AI Configuration</span>
            </button>
          </div>

          {/* SMTP Config Button */}
          <div
            className="flex items-center gap-3 p-4 rounded-xl border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:translate-x-1"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 p-2 pl-3 pr-4 rounded-full  transition"
            >
              <FiMessageCircle className="text-lg" />
              <span className="font-medium">Configure SMTP</span>
            </button>
          </div>

          {/* Clear Flow Button */}
          <button
            onClick={handleClearFlow}
            className="w-full p-3 mt-2 rounded-xl border shadow-sm flex items-center justify-center gap-2 hover:shadow-md transition-all duration-300"
            style={{
              backgroundColor: 'var(--background)',
              border: `1px solid ${theme.colors.danger}`,
              color: theme.colors.danger,
            }}
          >
            <FiTrash2 /> Clear Flow
          </button>

          {/* Modals */}
          <ApiConfigModal
            isOpen={showApiModal}
            onClose={() => setShowApiModal(false)}
            apiConfig={apiConfig}
            onSave={handleApiConfigSave}
          />
          <SmtpModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        </div>

      </div>

      {/* Canvas */}
      <div
        className="w-full h-full relative transition-colors duration-300"
        style={{ backgroundColor: 'var(--background)' }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChangeHandler}
          onConnect={onConnect}
          // fitView
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={[16, 16]}
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 0, zoom: 0 }}
          panOnDrag={true}
          zoomOnPinch={true}
          deleteKeyCode={['Backspace', 'Delete']}
        >


          <Panel
            position="top-right"
            className="flex items-center justify-between gap-4 p-4 bg-[var(--sidebar)] rounded-xl shadow-lg backdrop-blur-sm border border-[var(--border)]"
          >
            <div className="flex items-start gap-4 flex-1">
              {/* Flow Name Input */}
              <div className="w-full max-w-xs relative">
                <input
                  type="text"
                  value={flowName ?? flowState.flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm font-medium placeholder-gray-400 ${nameError ? 'border-[var(--danger)]' : 'border-[var(--border)]'
                    }`}
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--text)',
                  }}
                  placeholder="Flow name"
                />
                {nameError && (
                  <p className="absolute mt-1 text-xs font-medium text-[var(--danger)]">
                    {nameError}
                  </p>
                )}
              </div>

              {/* Domain Input */}
              <div className="w-full max-w-sm relative">
                <input
                  type="text"
                  value={websiteDomain}
                  onChange={(e) => setWebsiteDomainInput(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm font-medium placeholder-gray-400 ${domainError ? 'border-[var(--danger)]' : 'border-[var(--border)]'
                    }`}
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--text)',
                  }}
                  placeholder="Website domain (e.g., example.com)"
                />
                {domainError && (
                  <p className="absolute mt-1 text-xs font-medium text-[var(--danger)]">
                    {domainError}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons: Save + Embed */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Save Button */}
              <button
                onClick={handleSaveFlows}
                className="px-5 py-2.5 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                disabled={flowState.status === 'saving' || flowState.status === 'updating'}
              >
                <FiSave className="w-4 h-4" />
                {flowState.status === 'saving' || flowState.status === 'updating'
                  ? 'Saving...'
                  : flowState.currentFlowId || flowId
                    ? 'Update Flow'
                    : 'Save Flow'}
              </button>

              {/* Embed Button */}
              <div className="flex items-center gap-3">
                {/* Embed Button (Only shows if nodes and domain are ready) */}
            {/* Embed Button (Only shows if flow is saved and has nodes) */}
{(flowState.currentFlowId || flowId) && flowState.nodes.length > 0 ? (
  <button
    onClick={() => setShowEmbedModal(true)}
    className="px-5 py-2.5 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
  >
    <FiCode className="w-4 h-4" />
    Embed Chatbot
  </button>
) : (
  // Info icon when conditions not met
  <div className="group relative flex items-center justify-center">
    <FaInfo
      className="text-gray-400 w-5 h-5 cursor-not-allowed"
      title={flowState.nodes.length === 0 
        ? "Add nodes to your flow before embedding" 
        : "Save your flow to enable embedding"}
    />
    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
      {flowState.nodes.length === 0 
        ? "Add nodes to your flow before embedding" 
        : "Save your flow to enable embedding"}
    </div>
  </div>
)}
              </div>
            </div>
          </Panel>





          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'text') return theme.colors.primary;
              if (node.type === 'custom') return theme.colors.secondary;
              if (node.type === 'webhook') return theme.colors.success;
              return '#eee';
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              border: `1px solid ${theme.colors.border}`
            }}
          />
          <Controls
            className="shadow-md rounded-lg overflow-hidden"
            style={{
              right: 10,
              bottom: 20,
              border: `1px solid ${theme.colors.border}`
            }}
          />
          <Background
            color={theme.colors.border}
            gap={24}
            variant="dots"
            className="opacity-30"
          />
        </ReactFlow>


      </div>


      <ChatbotPreview nodes={nodes} edges={edges} />

      {showEmbedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-[var(--sidebar)] p-6 rounded-lg shadow-lg w-1/2 max-w-2xl"
            style={{ border: `1px solid ${theme.colors.border}` }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Embed Your Chatbot</h2>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="text-[var(--text)] hover:text-[var(--danger)]"
              >
                ✕
              </button>
            </div>
            <EmbedWidget nodes={nodes} edges={edges} flowId={flowId ?? flowState.currentFlowId} websiteDomain={websiteDomain ?? flowState.websiteDomain} />
          </div>
        </div>
      )}


    </div>
  )
}