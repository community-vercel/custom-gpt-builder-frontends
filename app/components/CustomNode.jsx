import { Handle, Position } from 'reactflow';
import { useDispatch } from 'react-redux';
import { updateNode } from '../../store/flowBuilderSlice';

export default function CustomNode({ id, data }) {
  const dispatch = useDispatch();

  const onChangeLabel = (val) => {
    dispatch(updateNode({ id, data: { ...data, label: val } }));
  };

  const onAddOption = () => {
    dispatch(updateNode({
      id,
      data: { ...data, options: [...data.options, `Option ${data.options.length + 1}`] }
    }));
  };

  const onChangeOption = (index, val) => {
    const newOptions = [...data.options];
    newOptions[index] = val;
    dispatch(updateNode({ id, data: { ...data, options: newOptions } }));
  };

  return (
    <div className="p-3 border bg-white rounded relative min-w-[200px]">
      <Handle type="target" position={Position.Top} />

      <input
        value={data.label}
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

          {/* Unique Handle for each option */}
          <Handle
            type="source"
            position={Position.Right}
            id={`option-${i}`}
            style={{
              top: '50%',
              transform: `translateY(-50%)`,
              right: '-8px',
              background: '#555'
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