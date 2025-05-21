import React from 'react';
import { FiX, FiFolder, FiTrash2, FiPlus } from 'react-icons/fi';

const FlowSelector = ({ 
  flows, 
  currentFlowId,
  onSelect, 
  onDelete, 
  onNew,
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--sidebar)',
          border: '1px solid var(--border)',
          color: 'var(--text)'
        }}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">My Flows</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FiX />
          </button>
        </div>
        
        <div className="p-4">
          <button
            onClick={() => {
              onNew();
              onClose();
            }}
            className="w-full mb-4 p-3 rounded-lg flex items-center justify-center gap-2 border border-dashed hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiPlus /> New Flow
          </button>
          
          <div className="space-y-2">
            {flows.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                No saved flows yet
              </p>
            ) : (
              flows.map(flow => (
                <div 
                  key={flow._id}
                  className={`p-3 rounded-lg flex justify-between items-center cursor-pointer ${
                    currentFlowId === flow._id 
                      ? 'bg-blue-100 dark:bg-blue-900' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div 
                    className="flex items-center gap-3 flex-grow"
                    onClick={() => onSelect(flow._id)}
                  >
                    <FiFolder className="text-blue-500" />
                    <span className="font-medium">{flow.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(flow.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(flow._id);
                    }}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowSelector;