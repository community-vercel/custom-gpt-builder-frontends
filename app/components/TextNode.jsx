// app/components/TextNode.jsx
'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';

export default function TextNode({ data }) {
  const handleChange = (value) => {
    if (data.onChange) {
      data.onChange(value);
    } else {
      console.warn(`onChange is not defined for TextNode with id ${data.id || 'unknown'}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md border w-64">
      <div className="font-bold mb-2">Text Message</div>
      <textarea
        value={data.label || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Enter message"
        className="p-1 border rounded w-full mb-2 h-20"
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}