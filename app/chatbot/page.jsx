'use client';

import React, { useCallback, useState } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
  } from 'reactflow';
import 'reactflow/dist/style.css';
import FlowBuilder from "../components/FlowBuilder";
export default function ChatbotFlowPage() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
}
