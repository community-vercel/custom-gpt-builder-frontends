
'use client';

import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Panel,
  useReactFlow,
} from 'reactflow';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { toast, Toaster } from 'react-hot-toast';
import {
  setNodes as setStoreNodes,
  updateNode,
  addNode,
  clearFlow,
  setWebsiteDomain,
  saveFlow,
  updateFlow,
  loadFlows,
  loadFlow,
  setEdges as setEdgesAction,
  setFlowName as setStoreFlowName,
} from '../../store/flowBuilderSlice';
import { setSmtpConfig, fetchSmtpConfig } from '../../store/smtpSlice';
import { setapiConfig, fetchApiConfig } from '../../store/apiConfigSlice';
import CustomNode from './CustomNode';
import TextNode from './TextNode';
import WebhookNode from './WebhookNode';
import FormNode from './FormNode';
import ConditionNode from './ConditionNode';
import SingleInputFormNode from './SingleInputNode';
import SingleInputApi from './SingleAPi';
import ChatbotPreview from './ChatbotPreview';
import ApiConfigModal from './APiConfig';
import SmtpModal from './Smtp';
import EmbedWidget from './EmbedWidget';
import {
  FiMessageCircle,
  FiZap,
  FiLink,
  FiTrash2,
  FiSave,
  FiSun,
  FiMoon,
  FiDroplet,
  FiSend,
  FiSettings,
  FiCode,
  FiFolder,
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiHome,
} from 'react-icons/fi';
import { BsBoxes, BsPalette } from 'react-icons/bs';
import { FaInfo } from 'react-icons/fa';
import { AiFillAliwangwang } from 'react-icons/ai';
import 'reactflow/dist/style.css';
import './flowbuilder.css';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
// Node types for React Flow
const nodeTypes = {
  custom: CustomNode,
  text: TextNode,
  webhook: WebhookNode,
  form: FormNode,
  condition: ConditionNode,
  singleInput: SingleInputFormNode,
  aiinput: SingleInputApi,
};

// Modern theme configurations
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
      text: '#1e293b',
      border: '#d1d5db',
      accent: '#dbeafe',
      glow: 'rgba(59, 130, 246, 0.3)',
      card: 'rgba(255, 255, 255, 0.95)',
    },
    icon: <FiSun className="text-amber-500 text-2xl" />,
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#fbbf24',
      success: '#34d399',
      danger: '#f87171',
      background: '#0f172a',
      sidebar: '#1e293b',
      text: '#f1f5f9',
      border: '#475569',
      accent: '#1e40af',
      glow: 'rgba(96, 165, 250, 0.4)',
      card: 'rgba(30, 41, 59, 0.95)',
    },
    icon: <FiMoon className="text-indigo-300 text-2xl" />,
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#06b6d4',
      secondary: '#0ea5e9',
      success: '#14b8a6',
      danger: '#f43f5e',
      background: '#ecfeff',
      sidebar: '#cffafe',
      text: '#083344',
      border: '#a5f3fc',
      accent: '#67e8f9',
      glow: 'rgba(6, 182, 212, 0.3)',
      card: 'rgba(207, 250, 254, 0.95)',
    },
    icon: <FiDroplet className="text-cyan-500 text-2xl" />,
  },
};
const nodeTemplates = [
 {
 type: 'custom',
 icon: <FiZap className="text-[var(--secondary)] text-2xl animate-pulse" />, // Larger icon with pulse
 label: 'Options',
 category: 'Actions',
 bg: 'bg-gradient-to-br from-[var(--secondary)] via-amber-400 to-[var(--primary)] hover:bg-gradient-to-br hover:from-amber-500 hover:to-blue-600', // Bolder gradient
 data: {
 label: 'Options Node',
 options: ['Option 1', 'Option 2'],
 },
 hoverClass: 'hover:scale-105 hover:shadow-2xl transition-all duration-300', // Hover effect
 },
 {
 type: 'text',
 icon: <FiMessageCircle className="text-[var(--primary)] text-2xl animate-bounce" />, // Larger icon with bounce
 label: 'Text Message',
 category: 'Messages',
 bg: 'bg-gradient-to-br from-[var(--primary)] via-blue-300 to-[var(--success)] hover:bg-gradient-to-br hover:from-blue-400 hover:to-green-500',
 data: { label: 'New Message' },
 hoverClass: 'hover:scale-105 hover:shadow-2xl transition-all duration-300',
 },
 {
 type: 'webhook',
 icon: <FiLink className="text-[var(--success)] text-2xl animate-pulse" />,
 label: 'Webhook',
 category: 'Integrations',
 bg: 'bg-gradient-to-br from-[var(--success)] via-teal-300 to-[var(--primary)] hover:bg-gradient-to-br hover:from-teal-400 hover:to-blue-500',
 data: { url: 'https://example.com', method: 'POST' },
 hoverClass: 'hover:scale-105 hover:shadow-2xl transition-all duration-300',
 },
 {
 type: 'form',
 icon: <span className="text-2xl animate-spin">📝</span>, // Larger emoji with spin
 label: 'Form',
 category: 'Inputs',
 bg: 'bg-gradient-to-br from-[var(--primary)] via-indigo-300 to-[var(--secondary)] hover:bg-gradient-to-br hover:from-indigo-400 hover:to-amber-500',
 data: {
 fields: [
 { label: 'Name', key: 'name', type: 'text', required: true },
 { label: 'Email', key: 'email', type: 'email', required: true },
 ],
 },
 hoverClass: 'hover:scale-105 hover:shadow-2xl transition-all duration-300',
 },
 {
 type: 'singleInput',
 icon: <FiSend className="text-[var(--success)] text-2xl animate-bounce" />,
 label: 'Single Input',
 category: 'Inputs',
 bg: 'bg-gradient-to-br from-[var(--success)] via-green-300 to-[var(--secondary)] hover:bg-gradient-to-br hover:from-green-400 hover:to-amber-500',
 data: { placeholder: 'Type your message...' },
 hoverClass: 'hover:scale-105 hover:shadow-2xl transition-all duration-300',
 },
 {
 type: 'condition',
 icon: <FiZap className="text-yellow-600 text-2xl animate-pulse" />,
 label: 'Condition',
 category: 'Logic',
 bg: 'bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-600 hover:bg-gradient-to-br hover:from-yellow-500 hover:to-orange-500',
 data: { label: 'Condition' },
 hoverClass: 'hover:scale-105 hover:shadow-2xl transition-all duration-300',
 },
 {
 type: 'aiinput',
 icon: <AiFillAliwangwang className="text-white text-3xl drop-shadow-md animate-bounce" />, // Larger icon
 label: 'AI Chat',
 category: 'AI',
 bg: 'bg-gradient-to-br from-blue-500 via-green-400 to-blue-700 hover:bg-gradient-to-br hover:from-blue-600 hover:via-green-500 hover:to-blue-800',
 data: {
 placeholder: 'Type your message...',
 apiConfig: {
 provider: 'openai',
 openai: { apiKey: '', model: 'gpt-3.5-turbo' },
 deepseek: { apiKey: '', model: 'deepseek-chat' },
 gemini: { apiKey: '', model: 'gemini-pro' },
 },
 },
 hoverClass: 'hover:scale-105 hover:shadow-2xl transition-all duration-300',
 },
];
// Utility to validate domain
const validateDomain = (domain) => {
  const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};

// Toast styling
const getToastStyle = (theme) => ({
  background: theme.colors.card,
  color: theme.colors.text,
  border: `1px solid ${theme.colors.primary}`,
  borderRadius: '12px',
  boxShadow: `0 8px 24px ${theme.colors.glow}`,
  fontFamily: 'Poppins, sans-serif',
  fontSize: '14px',
  padding: '12px 24px',
  backdropFilter: 'blur(10px)',
});

export default function FlowBuilder() {
  const dispatch = useDispatch();
  const flowState = useSelector((state) => state.flowBuilder);
  const apiConfig = useSelector((state) => state.apiConfig.config || {});
  const { data: session } = useSession();
  const { screenToFlowPosition } = useReactFlow();
  const searchParams = useSearchParams();
  const flowId = searchParams.get('flow');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState(flowState.flowName || '');
  const [websiteDomain, setWebsiteDomainInput] = useState(flowState.websiteDomain || '');
  const [nameError, setNameError] = useState('');
  const [domainError, setDomainError] = useState('');
  const [currentTheme, setCurrentTheme] = useState('light');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [dropPosition, setDropPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    Messages:false,
    Actions: false,
    Integrations: false,
    Inputs: false,
    Logic: false,
    AI: false,
  });
  const [history, setHistory] = useState({ past: [], future: [] });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const canvasRef = useRef(null);
  const theme = themes[currentTheme];

  // Initialize data fetching
  useEffect(() => {
    if (session?.user?.id) {
      dispatch(fetchApiConfig(session.user.id));
      dispatch(fetchSmtpConfig(session.user.id));
      dispatch(loadFlows(session.user.id));
    }
  }, [session?.user?.id, dispatch]);

  // Sync Redux state with local state, preserving positions
useEffect(() => {
  console.log('useEffect: Syncing flowState to local state', {
    reduxNodes: flowState.nodes,
    reduxEdges: flowState.edges,
    flowName: flowState.flowName,
    websiteDomain: flowState.websiteDomain,
  });

  if (flowState.nodes) {
    setNodes((prevNodes) => {
      const updatedNodes = flowState.nodes.map((reduxNode) => {
        const existingNode = prevNodes.find((n) => n.id === reduxNode.id);
        const nodeType = reduxNode.type;

        // Find template to ensure default data
        const template = nodeTemplates.find((t) => t.type === nodeType);
        const defaultData = template ? { ...template.data } : {};

        console.log(`Processing node ID: ${reduxNode.id}, Type: ${nodeType}, API Data:`, reduxNode.data);

        const newNode = {
          ...reduxNode,
          position: existingNode?.position || reduxNode.position || { x: 0, y: 0 },
          data: {
            ...defaultData,
            ...reduxNode.data,
            onChange: (value) => {
              console.log(`onChange called for node ${reduxNode.id}, value:`, value);
              const dataUpdate = typeof value === 'object' ? value : { label: value };
              dispatch(updateNode({ id: reduxNode.id, data: dataUpdate }));
            },
            onFieldsChange: ['form', 'custom'].includes(nodeType)
              ? (fieldsOrOptions) => {
                  console.log(`onFieldsChange called for node ${reduxNode.id}, fields/options:`, fieldsOrOptions);
                  const dataUpdate = nodeType === 'form' ? { fields: fieldsOrOptions } : { options: fieldsOrOptions };
                  dispatch(updateNode({ id: reduxNode.id, data: dataUpdate }));
                }
              : undefined,
            onApiConfigChange: nodeType === 'aiinput'
              ? (newConfig) => {
                  console.log(`onApiConfigChange called for node ${reduxNode.id}, config:`, newConfig);
                  dispatch(updateNode({ id: reduxNode.id, data: { apiConfig: newConfig } }));
                }
              : undefined,
            onSubmit: (data) => console.log(`${nodeType} submitted:`, data),
          },
        };

        console.log(`Node ${reduxNode.id} after adding callbacks:`, newNode.data);
        return newNode;
      });

      console.log('Updated nodes:', updatedNodes);
      return updatedNodes;
    });
  }

  setEdges(flowState.edges || []);
  setFlowName(flowState.flowName || '');
  setWebsiteDomainInput(flowState.websiteDomain || '');
}, [flowState.nodes, flowState.edges, flowState.flowName, flowState.websiteDomain, setNodes, setEdges, dispatch]);
const handleNodesChange = useCallback(
  (changes) => {
    onNodesChange(changes);
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        const nodeId = change.id;
        const updatedNode = nodes.find((n) => n.id === nodeId);
        if (updatedNode) {
          console.log('Node position changed:', { id: nodeId, position: change.position });
          // Update local nodes state
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId ? { ...n, position: { x: change.position.x, y: change.position.y } } : n
            )
          );
          // Dispatch to Redux store
          dispatch(
            updateNode({
              id: nodeId,
              data: { ...updatedNode.data },
              position: { x: change.position.x, y: change.position.y },
            })
          );
        }
      }
    });
  },
  [onNodesChange, nodes, dispatch, setNodes]
);

  // Validate edges
  useEffect(() => {
    const validEdges = edges.filter((edge) => {
      const sourceExists = nodes.some((n) => n.id === edge.source);
      const targetExists = nodes.some((n) => n.id === edge.target);
      return sourceExists && targetExists;
    });
    if (validEdges.length !== edges.length) {
      setEdges(validEdges);
      dispatch(setEdgesAction(validEdges));
    }
  }, [nodes, edges, dispatch]);

  // Handle drag-and-drop
  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setDropPosition(position);
    },
    [screenToFlowPosition]
  );

const onDrop = useCallback(
  (event) => {
    event.preventDefault();
    setDropPosition(null);
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const template = nodeTemplates.find((t) => t.type === type);
    if (!template) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const id = crypto.randomUUID();
    const newNode = {
      id,
      type,
      position,
      data: {
        ...template.data,
        onChange: (value) => {
          console.log('onChange for new node:', id, 'value:', value);
          const dataUpdate = typeof value === 'object' ? value : { label: value };
          dispatch(updateNode({ id, data: dataUpdate }));
        },
        onSubmit: (data) => console.log(`${type} submitted:`, data),
        onFieldsChange:
          ['form', 'custom'].includes(type)
            ? (fieldsOrOptions) => {
                console.log('onFieldsChange for new node:', id, 'fields/options:', fieldsOrOptions);
                const dataUpdate = type === 'form' ? { fields: fieldsOrOptions } : { options: fieldsOrOptions };
                dispatch(updateNode({ id, data: dataUpdate }));
              }
            : undefined,
        onApiConfigChange:
          type === 'aiinput'
            ? (newConfig) => {
                console.log('onApiConfigChange for new node:', id, 'config:', newConfig);
                dispatch(updateNode({ id, data: { apiConfig: newConfig } }));
              }
            : undefined,
      },
    };

    console.log('Adding new node:', newNode);
    dispatch(addNode(newNode));
    setNodes((nds) => [...nds, newNode]);
    setHistory((prev) => ({
      past: [...prev.past, { action: 'addNode', node: newNode }],
      future: [],
    }));
    toast.success(`${template.label} added to flow`, { style: getToastStyle(theme) });
  },
  [dispatch, screenToFlowPosition, theme]
);

  // Handle node connections
 const onConnect = useCallback(
    (params) => {
      let label = '';
      let stroke = '#999';
      let edgeClassName = '';

      if (params.sourceHandle === 'yes') {
        label = 'Yes';
        stroke = theme.colors.success;
        edgeClassName = 'react-flow__edge-yes';
      } else if (params.sourceHandle === 'no') {
        label = 'No';
        stroke = theme.colors.danger;
        edgeClassName = 'react-flow__edge-no';
      } else if (params.sourceHandle?.startsWith('option-')) {
        const optionIndex = params.sourceHandle.split('-')[1];
        const sourceNode = nodes.find((n) => n.id === params.source);
        label = sourceNode?.data?.options?.[optionIndex] || `Option ${optionIndex}`;
        stroke = theme.colors.primary;
        edgeClassName = 'react-flow__edge-option';
      }

      const newEdges = addEdge(
        {
          ...params,
          label,
          className: edgeClassName, // Add custom class for styling
          style: {
            stroke,
            strokeWidth: 4, // Thicker edges
            strokeDasharray: '10 5', // Dashed pattern
          },
          animated: true,
          type: 'smoothstep',
          labelStyle: {
            fontSize: '14px',
            fontWeight: 600,
            fill: theme.colors.text,
          },
          markerEnd: {
  type: 'arrowclosed',
  color: stroke,
  width: 10,
  height: 10,
},
          labelBgStyle: {
            fill: theme.colors.card,
            padding: '4px 8px',
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: `0 2px 8px ${theme.colors.glow}`,
          },
        },
        edges
      );

      setEdges(newEdges);
      dispatch(setEdgesAction(newEdges));
      setHistory((prev) => ({
        past: [...prev.past, { action: 'addEdge', edge: newEdges[newEdges.length - 1] }],
        future: [],
      }));
    },
    [edges, nodes, dispatch, theme]
  );
  

  // Save flow with validation
  const handleSaveFlows = useCallback(async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to save your flow', { style: getToastStyle(theme) });
      return;
    }

    if (!flowName.trim()) {
      setNameError('Flow name is required');
      return;
    }
    if (!websiteDomain.trim()) {
      setDomainError('Website domain is required');
      return;
    }
    if (!validateDomain(websiteDomain)) {
      setDomainError('Invalid domain format (e.g., example.com)');
      return;
    }
    if (nodes.length === 0) {
      toast.error('Add at least one node to save the flow', { style: getToastStyle(theme) });
      return;
    }

    setNameError('');
    setDomainError('');

    try {
      const action = flowState.currentFlowId || flowId ? updateFlow : saveFlow;
      await dispatch(
        action({
          userId: session.user.id,
          flowId: flowState.currentFlowId || flowId,
          nodes,
          edges,
          flowName,
          websiteDomain,
        })
      ).unwrap();

      dispatch(setStoreFlowName(flowName));
      dispatch(setWebsiteDomain(websiteDomain));
      toast.success('Flow saved successfully!', { style: getToastStyle(theme) });
    } catch (error) {
      toast.error(`Failed to save flow: ${error || 'Unknown error'}`, {
        style: getToastStyle(theme),
      });
    }
  }, [dispatch, session, flowId, flowState, nodes, edges, flowName, websiteDomain, theme]);
useEffect(() => {
  if (session?.user?.id && flowId) {
    dispatch(loadFlow({ userId: session.user.id, flowId }));
  }
}, [session?.user?.id, flowId, dispatch]);
  // Undo/Redo functionality
  const handleUndo = useCallback(() => {
    if (history.past.length === 0) return;
    const lastAction = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    if (lastAction.action === 'addNode') {
      setNodes(nodes.filter((n) => n.id !== lastAction.node.id));
      dispatch(setStoreNodes(nodes.filter((n) => n.id !== lastAction.node.id)));
    } else if (lastAction.action === 'addEdge') {
      setEdges(edges.filter((e) => e.id !== lastAction.edge.id));
      dispatch(setEdgesAction(edges.filter((e) => e.id !== lastAction.edge.id)));
    }

    setHistory({ past: newPast, future: [lastAction, ...history.future] });
  }, [history, nodes, edges, dispatch]);

  const handleRedo = useCallback(() => {
    if (history.future.length === 0) return;
    const nextAction = history.future[0];
    const newFuture = history.future.slice(1);

    if (nextAction.action === 'addNode') {
      dispatch(addNode(nextAction.node));
      setNodes((nds) => [...nds, nextAction.node]);
    } else if (nextAction.action === 'addEdge') {
      setEdges([...edges, nextAction.edge]);
      dispatch(setEdgesAction([...edges, nextAction.edge]));
    }

    setHistory({ past: [...history.past, nextAction], future: newFuture });
  }, [history, edges, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveFlows();
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFlows, handleUndo, handleRedo]);

  // Theme handling
  const toggleThemePicker = () => setShowThemePicker((prev) => !prev);
  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    setShowThemePicker(false);
  };

  // Sidebar categories
  const categories = useMemo(
    () =>
      nodeTemplates.reduce((acc, template) => {
        acc[template.category] = acc[template.category] || [];
        acc[template.category].push(template);
        return acc;
      }, {}),
    []
  );

  const filteredCategories = useMemo(
    () =>
      Object.keys(categories).reduce((acc, category) => {
        const filtered = categories[category].filter((template) =>
          template.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) acc[category] = filtered;
        return acc;
      }, {}),
    [categories, searchQuery]
  );

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  // Validate AI configuration
  const apiConfigIsValid = useMemo(
    () =>
      apiConfig.chatbot?.provider &&
      (apiConfig.openai?.apiKey || apiConfig.deepseek?.apiKey || apiConfig.gemini?.apiKey),
    [apiConfig]
  );

  // Toggle sidebar
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
// useEffect(() => {
//   setNodes(flowState.nodes || []);
//   setEdges(flowState.edges || []);
//   setFlowName(flowState.flowName || '');
//   setWebsiteDomainInput(flowState.websiteDomain || '');
// }, [flowState.nodes, flowState.edges, flowState.flowName, flowState.websiteDomain, setNodes, setEdges]);
 
return (
    <div
      className="flex h-screen w-full font-sans transition-colors duration-300"
      style={{
        '--primary': theme.colors.primary,
        '--secondary': theme.colors.secondary,
        '--success': theme.colors.success,
        '--danger': theme.colors.danger,
        '--background': theme.colors.background,
        '--sidebar': theme.colors.sidebar,
        '--text': theme.colors.text,
        '--border': theme.colors.border,
        '--accent': theme.colors.accent,
        '--glow': theme.colors.glow,
        '--card': theme.colors.card,
        fontFamily: 'Poppins, sans-serif',
      }}
      role="main"
      aria-label="Flow Builder Interface"
    >
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Sidebar */}
  <aside
  className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r shadow-sm transition-transform duration-300 ease-in-out transform md:static md:transform-none ${
    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
  } flex flex-col p-4 overflow-y-auto`}
  style={{ borderColor: 'var(--border, #e5e7eb)' }}
  aria-label="Sidebar Navigation"
>
  {/* Header */}
  <header className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <BsBoxes className="text-[var(--primary, #3b82f6)] text-lg" />
      <h1 className="text-base font-semibold text-gray-900">Flow Builder</h1>
    </div>
    <div className="flex items-center gap-1">
      <button
        onClick={toggleThemePicker}
        className="p-1.5 text-gray-500 hover:text-[var(--primary, #3b82f6)] rounded-md transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[var(--primary, #3b82f6)]"
        title="Change theme"
        aria-label="Toggle theme picker"
      >
        <BsPalette className="text-sm" />
      </button>
      <button
        onClick={toggleSidebar}
        className="p-1.5 text-gray-500 hover:text-[var(--primary, #3b82f6)] rounded-md transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[var(--primary, #3b82f6)] md:hidden"
        aria-label="Toggle sidebar"
      >
        <FiChevronDown className={`text-sm transition-transform duration-150 ${isSidebarOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  </header>
    <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[var(--primary, #3b82f6)] mb-4"
          aria-label="Go to Home"
          title="Go to Home"
        >
          <FiHome className="text-[var(--primary, #3b82f6)] text-sm" />
          Home
        </Link>

  {/* Theme Picker */}
  {showThemePicker && (
    <div
      className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded-md shadow-sm animate-fade-in"
      role="dialog"
      aria-label="Theme Picker"
    >
      <h2 className="text-xs font-medium text-gray-700 mb-2">Select Theme</h2>
      <div className="grid grid-cols-2 gap-1.5">
        {Object.entries(themes).map(([key, config]) => (
          <button
            key={key}
            onClick={() => changeTheme(key)}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-sm transition-colors duration-150 ${
              currentTheme === key
                ? 'bg-[var(--primary, #3b82f6)] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            } focus:outline-none focus:ring-1 focus:ring-[var(--primary, #3b82f6)]`}
            aria-label={`Switch to ${config.name} theme`}
          >
            {config.icon}
            {config.name}
          </button>
        ))}
      </div>
    </div>
  )}

  {/* Search */}
  <div className="mb-4">
    <div className="relative">
      <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search nodes..."
        className="w-full pl-8 pr-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary, #3b82f6)] transition-colors duration-150"
        aria-label="Search nodes"
      />
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 space-y-3">
    {Object.entries(filteredCategories).map(([category, templates]) => (
      <div key={category}>
        <button
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[var(--primary, #3b82f6)]"
          aria-expanded={expandedCategories[category]}
          aria-label={`Toggle ${category} category`}
        >
          <span>{category}</span>
          {expandedCategories[category] ? (
            <FiChevronUp className="text-gray-400 text-xs" />
          ) : (
            <FiChevronDown className="text-gray-400 text-xs" />
          )}
        </button>
        {expandedCategories[category] && (
          <div className="mt-1.5 space-y-1 pl-1 animate-slide-down">
            {templates.map((template, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-2 px-2 py-1.5 bg-white border border-gray-100 rounded-md cursor-move hover:bg-gray-50 transition-all duration-150"
                draggable
                onDragStart={(e) => {
                  if (template.type === 'aiinput' && !apiConfigIsValid) {
                    e.preventDefault();
                    toast.error('Please configure AI settings first', {
                      style: getToastStyle(theme),
                    });
                    return;
                  }
                  e.dataTransfer.setData('application/reactflow', template.type);
                }}
                role="button"
                aria-label={`Add ${template.label} to canvas`}
              >
                <div className={`p-1 rounded-sm ${template.bg} w-6 h-6 flex items-center justify-center`}>
                  {template.icon}
                </div>
                <span className="text-xs font-medium text-gray-800">{template.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    ))}

    {/* Configurations */}
    <div className="mt-4">
      <h4 className="text-xs font-medium text-gray-700 mb-1.5">Configurations</h4>
      <button
        onClick={() => setShowApiModal(true)}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-100 rounded-md hover:bg-gray-50 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-[var(--primary, #3b82f6)]"
        aria-label="Configure AI settings"
      >
        <FiSettings className="text-[var(--primary, #3b82f6)] text-xs" />
        AI Configuration
      </button>
      <button
        onClick={() => setShowSmtpModal(true)}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-100 rounded-md hover:bg-gray-50 transition-all duration-150 mt-1 focus:outline-none focus:ring-1 focus:ring-[var(--primary, #3b82f6)]"
        aria-label="Configure SMTP settings"
      >
        <FiMail className="text-[var(--primary, #3b82f6)] text-xs" />
        SMTP Configuration
      </button>
    </div>

    {/* Clear Flow */}
    <button
      onClick={() => dispatch(clearFlow())}
      className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium text-red-500 bg-white border border-red-100 rounded-md hover:bg-red-50 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-red-500"
      aria-label="Clear flow"
    >
      <FiTrash2 className="text-xs" />
      Clear Flow
    </button>
  </nav>
</aside>
      {/* Main Canvas */}
      <main
        className="w-full h-full relative transition-colors duration-300"
        style={{ backgroundColor: 'var(--background)' }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        ref={canvasRef}
        aria-label="Flow Builder Canvas"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={[16, 16]}
          proOptions={{ hideAttribution: true }}
          panOnDrag={true}
          zoomOnPinch={true}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          {dropPosition && (
            <div
              className="absolute w-8 h-8 bg-[var(--primary)] opacity-20 rounded-full animate-pulse shadow-lg"
              style={{ left: dropPosition.x, top: dropPosition.y, transform: 'translate(-50%, -50%)' }}
              aria-hidden="true"
            />
          )}

          <Panel
            position="top-right"
            className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-[var(--card)] rounded-xl shadow-2xl backdrop-blur-md border border-[var(--border)] w-full md:w-auto"
            aria-label="Control Panel"
          >
            <div className="flex flex-col md:flex-row items-start gap-4 flex-1">
              <div className="w-full md:max-w-xs relative">
                <input
                  type="text"
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm font-medium placeholder-gray-400 backdrop-blur-md ${
                    nameError ? 'border-[var(--danger)]' : 'border-[var(--border)]'
                  }`}
                  style={{ backgroundColor: 'var(--card)', color: 'var(--text)', boxShadow: `0 0 8px ${theme.colors.glow}` }}
                  placeholder="Flow name"
                  aria-label="Flow name"
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? 'name-error' : undefined}
                />
                {nameError && (
                  <p id="name-error" className="absolute mt-1 text-xs font-medium text-[var(--danger)] animate-slide-down">
                    {nameError}
                  </p>
                )}
              </div>

              <div className="w-full md:max-w-sm relative">
                <input
                  type="text"
                  value={websiteDomain}
                  onChange={(e) => setWebsiteDomainInput(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm font-medium placeholder-gray-400 backdrop-blur-md ${
                    domainError ? 'border-[var(--danger)]' : 'border-[var(--border)]'
                  }`}
                  style={{ backgroundColor: 'var(--card)', color: 'var(--text)', boxShadow: `0 0 8px ${theme.colors.glow}` }}
                  placeholder="Website domain (e.g., example.com)"
                  aria-label="Website domain"
                  aria-invalid={!!domainError}
                  aria-describedby={domainError ? 'domain-error' : undefined}
                />
                {domainError && (
                  <p id="domain-error" className="absolute mt-1 text-xs font-medium text-[var(--danger)] animate-slide-down">
                    {domainError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleUndo}
                className="px-4 py-2 text-[var(--text)] rounded-lg font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2 bg-[var(--card)] disabled:opacity-50 hover:-translate-y-1"
                disabled={history.past.length === 0}
                aria-label="Undo last action"
              >
                <FiChevronUp className="w-4 h-4" />
                Undo
              </button>
              <button
                onClick={handleRedo}
                className="px-4 py-2 text-[var(--text)] rounded-lg font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2 bg-[var(--card)] disabled:opacity-50 hover:-translate-y-1"
                disabled={history.future.length === 0}
                aria-label="Redo last action"
              >
                <FiChevronDown className="w-4 h-4" />
                Redo
              </button>
              <button
                onClick={handleSaveFlows}
                className="px-5 py-2.5 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] disabled:opacity-50"
                disabled={flowState.status === 'saving' || flowState.status === 'updating'}
                aria-label={flowState.currentFlowId || flowId ? 'Update flow' : 'Save flow'}
              >
                <FiSave className="w-4 h-4" />
                {flowState.status === 'saving' || flowState.status === 'updating'
                  ? 'Saving...'
                  : flowState.currentFlowId || flowId
                  ? 'Update Flow'
                  : 'Save Flow'}
              </button>
              {(flowState.currentFlowId || flowId) && nodes.length > 0 ? (
                <button
                  onClick={() => setShowEmbedModal(true)}
                  className="px-5 py-2.5 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  aria-label="Embed chatbot"
                >
                  <FiCode className="w-4 h-4" />
                  Embed Chatbot
                </button>
              ) : (
                <div className="group relative flex items-center justify-center">
                  <FaInfo
                    className="text-gray-400 w-5 h-5 cursor-not-allowed"
                    aria-label="Embedding disabled"
                    title={nodes.length === 0 ? 'Add nodes to your flow before embedding' : 'Save your flow to enable embedding'}
                  />
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    {nodes.length === 0 ? 'Add nodes to your flow before embedding' : 'Save your flow to enable embedding'}
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'text') return theme.colors.primary;
              if (node.type === 'custom') return theme.colors.secondary;
              if (node.type === 'webhook') return theme.colors.success;
              return '#e5e7eb';
            }}
            style={{
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              boxShadow: `0 6px 16px ${theme.colors.glow}`,
            }}
            aria-label="MiniMap for flow navigation"
          />
          <Controls
            className="shadow-lg rounded-lg overflow-hidden bg-[var(--card)] backdrop-blur-md"
            style={{ right: 10, bottom: 20, border: `1px solid ${theme.colors.border}`, boxShadow: `0 4px 12px ${theme.colors.glow}` }}
            aria-label="Canvas controls"
          />
          <Background
            color={theme.colors.border}
            gap={24}
            variant="dots"
            className="opacity-15"
            aria-hidden="true"
          />
        </ReactFlow>
      </main>

      {/* Modals */}
      <ApiConfigModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        apiConfig={apiConfig}
        onSave={(newConfig) => dispatch(setapiConfig(newConfig))}
      />
      <SmtpModal
        isOpen={showSmtpModal}
        onClose={() => setShowSmtpModal(false)}
        onSave={(config) => dispatch(setSmtpConfig(config))}
      />
      {showEmbedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-label="Embed Chatbot Modal">
          <div className="bg-[var(--card)] p-6 rounded-xl shadow-2xl w-full max-w-lg md:max-w-2xl border border-[var(--border)] animate-slide-up backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text)]">Embed Your Chatbot</h2>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="text-[var(--text)] hover:text-[var(--danger)] transition-colors duration-200"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <EmbedWidget
              nodes={nodes}
              edges={edges}
              flowId={flowId ?? flowState.currentFlowId}
              websiteDomain={websiteDomain ?? flowState.websiteDomain}
            />
          </div>
        </div>
      )}

      <ChatbotPreview nodes={nodes} edges={edges} />
    </div>
  );
}