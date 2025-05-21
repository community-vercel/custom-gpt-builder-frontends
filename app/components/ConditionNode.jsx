import React from 'react';
import { Handle, Position } from 'reactflow';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ConditionNode = ({ data }) => {
  return (
    <div className="rounded-xl border border-yellow-400 bg-yellow-50 p-4 shadow-lg min-w-[220px] text-sm">
      <div className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
        ⚖️ Condition Node
      </div>
      <input
        type="text"
        value={data.label}
        onChange={(e) => data.onChange?.(e.target.value)}
        placeholder='e.g. user_input === "yes"'
        className="w-full p-2 rounded border text-gray-700 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />

      {/* Yes/No Handles */}
      <div className="flex justify-between mt-4 text-xs text-yellow-700">
        <div className="flex items-center gap-1">
          <FiCheckCircle className="text-green-500" />
          Yes
        </div>
        <div className="flex items-center gap-1">
          <FiXCircle className="text-red-500" />
          No
        </div>
      </div>

      {/* Output Handles */}
      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '30%', background: 'green' }} />
      <Handle type="source" position={Position.Bottom} id="no" style={{ left: '70%', background: 'red' }} />

      {/* Input Handle */}
      <Handle type="target" position={Position.Top} style={{ background: '#facc15' }} />
    </div>
  );
};

export default ConditionNode