import React from 'react';
import { Handle, Position } from 'reactflow';

export default function TextNode({ data, id }) {
  const { label = '', onChange } = data;

  console.log(`TextNode ${id} rendered with data:`, data);

  return (
    <div className="p-4 bg-white rounded shadow-md border w-64">
      <div className="font-bold mb-2">Text Message   </div>
      <textarea
        value={label}
        onChange={(e) => {
          const newValue = e.target.value;
          console.log(`TextNode ${id} onChange triggered, new value:`, newValue);
          if (onChange) {
            onChange(newValue);
          } else {
            console.error(`onChange is undefined for TextNode ${id}, data:`, data);
          }
        }}
        placeholder="Enter message"
        className="p-1 border rounded w-full mb-2 h-20"
        aria-label={`Text input for node ${id}`}
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}