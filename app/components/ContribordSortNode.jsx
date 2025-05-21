"use client";
import { Handle, Position } from 'reactflow';

export default function ContribordSortNode({ data }) {
  return (
    <div className="bg-white border rounded-md shadow p-4 text-center">
      <div className="font-medium mb-2">🔀 Conditional Split</div>
      <div className="text-sm text-gray-500">{data.label}</div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" id="yes" position={Position.Bottom} style={{ left: '30%' }} />
      <Handle type="source" id="no" position={Position.Bottom} style={{ left: '70%' }} />
    </div>
  );
}