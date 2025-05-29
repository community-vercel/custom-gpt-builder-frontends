import React from 'react';
import { Handle, Position } from 'reactflow';

export default function CustomNode({ id, data }) {
  const onChangeLabel = (val) => {
    if (data.onChange) {
      console.log('CustomNode label changed:', val);
      data.onChange(val);
    }
  };

  const onAddOption = () => {
    const newOptions = [...data.options, `Option ${data.options.length + 1}`];
    if (data.onFieldsChange) {
      console.log('CustomNode adding option:', newOptions);
      data.onFieldsChange(newOptions);
    }
  };

  const onChangeOption = (index, val) => {
    const newOptions = [...data.options];
    newOptions[index] = val;
    if (data.onFieldsChange) {
      console.log('CustomNode option changed:', newOptions);
      data.onFieldsChange(newOptions);
    }
  };

  return (
    <div className="p-3 border bg-white rounded relative min-w-[200px]">
      <Handle type="target" position={Position.Top} />

      <input
        value={data.label || ''}
        onChange={(e) => onChangeLabel(e.target.value)}
        className="w-full mb-2 border p-1 text-sm rounded"
        placeholder="Label"
      />

      {data.options.map((opt, i) => (
        <div key={i} className="flex items-center justify-between mb-2 relative">
          <input
            value={opt}
            onChange={(e) => onChangeOption(i, e.target.value)}
            className="w-full border p-1 text-sm rounded"
          />
          <Handle
            type="source"
            position={Position.Right}
            id={`option-${i}`}
            style={{
              top: '50%',
              transform: `translateY(-50%)`,
              right: '-8px',
              background: '#555',
            }}
          />
        </div>
      ))}

      <button
        onClick={onAddOption}
        className="text-xs text-blue-600 mt-1 hover:underline"
      >
        + Add Option
      </button>
    </div>
  );
}