'use client';
import { FiSend } from 'react-icons/fi';
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

export default function SingleInputFormNode({ data, selected }) {
  const [inputValues, setInputValues] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.onSubmit) {
      data.onSubmit(inputValue);
    }
    setInputValues('');
  };

  return (
    <div
      className={`relative bg-white p-4 rounded-2xl shadow-md border-2 transition-all duration-300 ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />

      {/* <div className="text-sm font-medium text-gray-800 mb-2">
        {data.label || 'Input Field'}
      </div> */}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputValues}
          onChange={(e) => setInputValues(e.target.value)}
          placeholder={data.placeholder || 'Type your answer...'}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>

      {data.helperText && (
        <div className="text-xs text-gray-500 mt-2">{data.helperText}</div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
}