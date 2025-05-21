// pages/flow.js
import { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState
} from 'reactflow';
import ContribordSortNode from '../components/nodes/ContribordSortNode';

const nodeTypes = {
  contribordSort: ContribordSortNode
};

export default function FlowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (type === 'contribordSort') {
        const position = {
          x: event.clientX,
          y: event.clientY,
        };

        const newNode = {
          id: `${Date.now()}`,
          type,
          position,
          data: { 
            conditions: [{ id: '1', corridor: '', sortOrder: 'asc' }],
            onAddCondition: (newCondition) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === newNode.id
                    ? { 
                        ...node, 
                        data: { 
                          ...node.data, 
                          conditions: [...node.data.conditions, newCondition] 
                        } 
                      }
                    : node
                )
              );
            },
            onDeleteCondition: (id) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === newNode.id
                    ? { 
                        ...node, 
                        data: { 
                          ...node.data, 
                          conditions: node.data.conditions.filter(c => c.id !== id) 
                        } 
                      }
                    : node
                )
              );
            },
            onUpdateCondition: (id, field, value) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === newNode.id
                    ? { 
                        ...node, 
                        data: { 
                          ...node.data, 
                          conditions: node.data.conditions.map(c => 
                            c.id === id ? { ...c, [field]: value } : c
                          ) 
                        } 
                      }
                    : node
                )
              );
            }
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="flex h-screen w-full">
      <ReactFlowProvider>
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
        
        <Sidebar />
      </ReactFlowProvider>
    </div>
  );
}

// components/Sidebar.js
import { FiFilter } from 'react-icons/fi';

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 p-4 border-l border-gray-200 bg-white">
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Nodes</h3>
        <div
          className="p-3 border border-gray-200 rounded cursor-move mb-2 bg-white hover:bg-purple-50 transition-colors"
          onDragStart={(event) => onDragStart(event, 'contribordSort')}
          draggable
        >
          <div className="flex items-center">
            <FiFilter className="text-purple-500 mr-2" />
            <span>Contribord Sort</span>
          </div>
        </div>
      </div>
    </div>
  );
}