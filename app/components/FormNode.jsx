
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

export default function FormNode({ id, data, selected }) {
  const dispatch = useDispatch();
    const smtp = useSelector(state => state.smtp.config);

  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [fields, setFields] = useState(data.fields || []);
  const [newField, setNewField] = useState({
    label: '',
    key: '',
    type: 'text',
    required: false,
    options: []
  });
  const [newOption, setNewOption] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (data.onSubmit) {
      data.onSubmit(formData);
    }
  };

  const addField = () => {
    if (newField.label && newField.key) {
      const updated = [...fields, { ...newField }];
      setFields(updated);
      setNewField({
        label: '',
        key: '',
        type: 'text',
        required: false,
        options: [],
      });
  
      if (data.onFieldsChange) {
        data.onFieldsChange(updated); // <-- sync with parent/store
      }
    }
  };
  const removeField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  
    if (data.onFieldsChange) {
      data.onFieldsChange(updatedFields); // <-- sync
    }
  };

  const addOption = () => {
    if (newOption) {
      setNewField({
        ...newField,
        options: [...newField.options, newOption]
      });
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    const updatedOptions = [...newField.options];
    updatedOptions.splice(index, 1);
    setNewField({
      ...newField,
      options: updatedOptions
    });
  };

  return (
    <div className={`w-full p-4 rounded-lg border-2 ${selected ? 'border-blue-500' : 'border-gray-300'} bg-white w-80`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />


      {submitted ? (
        <div className="text-green-600 text-sm">Submitted successfully!</div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mb-4">
            {fields.map((field, index) => (
              <div key={index} className="mb-3 p-2 border border-gray-200 rounded">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs text-gray-600">{field.label}</label>
                  {data.onFieldsChange && (
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="text-red-500 text-xs"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  )}
                </div>
                
                {field.type === 'select' ? (
                  <select
                    name={field.key}
                    required={field.required}
                    value={formData[field.key] || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full p-2 border border-gray-300 rounded text-xs"
                  >
                    <option value="">Select an option</option>
                    {field.options.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.key}
                    required={field.required}
                    value={formData[field.key] || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full p-2 border border-gray-300 rounded text-xs"
                  />
                )}
              </div>
            ))}

            {fields.length > 0 && (
              <button
                type="submit"
                className="mt-2 w-full bg-blue-600 text-white text-xs p-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            )}
          </form>

          {data.onFieldsChange && (
            <>
            <div className="border-t pt-3">
      <h5 className="text-xs font-semibold mb-2">Email Settings</h5>
      <div className="space-y-2">
        <input
          type="email"
          placeholder="To Email"
          value={formData.toEmail || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, toEmail: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded text-xs"
        />

        <select
          value={formData.smtp || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, smtp: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded text-xs"
        >
          <option value="">Select email from  SMTP</option>
         {smtp?.username && <option value={smtp?.username}>{smtp?.username}</option>}
         
        </select>
      </div>
    </div>


            <div className="border-t pt-3">
              <h5 className="text-xs font-semibold mb-2">Add New Field</h5>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    className="flex-1 p-2 border border-gray-300 rounded text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Field Key"
                    value={newField.key}
                    onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                    className="flex-1 p-2 border border-gray-300 rounded text-xs"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                    className="p-2 border border-gray-300 rounded text-xs"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="select">Dropdown</option>
                  </select>
                  
                  <label className="flex items-center text-xs gap-1">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>

                {newField.type === 'select' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add option"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={addOption}
                        className="bg-blue-500 text-white p-2 rounded text-xs"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {newField.options.map((option, index) => (
                        <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                          {option}
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="ml-1 text-red-500"
                          >
                            <FiTrash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={addField}
                  className="w-full bg-green-500 text-white text-xs p-2 rounded hover:bg-green-600 flex items-center justify-center gap-1"
                >
                  <FiPlus size={12} /> Add Field
                </button>
              </div>
            </div>

            </>
          )}
        </>
      )}
    </div>
  );
}