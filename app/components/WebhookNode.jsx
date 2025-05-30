'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';

export default function WebhookNode({ data }) {
  const onChange = (key, value) => {
    if (data.onChange) {
      console.log('WebhookNode changed:', { [key]: value });
      data.onChange({ ...data, [key]: value });
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md border w-64">
      <div className="font-bold mb-2">Webhook</div>
      <select
        value={data.method || 'POST'}
        onChange={(e) => onChange('method', e.target.value)}
        className="p-1 border rounded w-full mb-2"
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
      <input
        type="text"
        value={data.url || ''}
        onChange={(e) => onChange('url', e.target.value)}
        placeholder="Enter URL"
        className="p-1 border rounded w-full mb-2"
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}