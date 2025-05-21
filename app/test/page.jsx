"use client";
import ReactFlow, { ReactFlowProvider, addEdge, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback, useState } from 'react';
import ContribordSortNode from '../components/ContribordSortNode'; // Adjust the import path as necessary
const nodeTypes = { ContribordSortNode: ContribordSortNode };

const initialNodes = [
  { id: '1', type: 'input', position: { x: 250, y: 0 }, data: { label: 'Start' } },
  { id: '2', type: 'default', position: { x: 250, y: 100 }, data: { label: 'Update Profile' } },
  { id: '3', type: 'ContribordSortNode', position: { x: 250, y: 220 }, data: { label: 'Condition: Age > 18' } },
  { id: '4', type: 'default', position: { x: 100, y: 350 }, data: { label: 'Email' } },
  { id: '5', type: 'default', position: { x: 400, y: 350 }, data: { label: 'SMS' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', sourceHandle: 'yes', target: '4', label: 'Yes' },
  { id: 'e3-5', source: '3', sourceHandle: 'no', target: '5', label: 'No' },
];

export default function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  return (
    <div style={{ width: '100%', height: '100vh' }}>

    <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
     
    </ReactFlowProvider>
    </div>
  );
}
