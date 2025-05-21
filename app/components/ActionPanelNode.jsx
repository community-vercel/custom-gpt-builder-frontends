'use client';

import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  FiChevronLeft, FiMail, FiPhone, FiUser, 
  FiBell, FiLink, FiClock, FiCode, FiDownload 
} from 'react-icons/fi';

export default function ActionPanelNode({ data }) {
  const [description, setDescription] = useState(data.description || '');
  const [activeSection, setActiveSection] = useState(null);

  const handleSave = () => {
    data.onSave({ description });
  };

  return (
    <div className="w-64 bg-white rounded-md shadow-sm border border-gray-200 font-sans text-sm">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200 bg-gray-50">
        <button 
          className="mr-2 text-gray-500 hover:text-gray-700"
          onClick={data.onClose}
        >
          <FiChevronLeft size={16} />
        </button>
        <h2 className="font-medium">Back to Examples</h2>
      </div>

      <div className="p-3 space-y-4 max-h-96 overflow-y-auto">
        {/* Actions Section */}
        <Section 
          title="Actions" 
          isOpen={activeSection === 'actions'}
          onToggle={() => setActiveSection(activeSection === 'actions' ? null : 'actions')}
        >
          <NodeItem icon={<FiMail className="text-blue-500" />} label="Email" />
          <NodeItem icon={<FiPhone className="text-green-500" />} label="SMS" indent />
          <NodeItem icon={<FiUser className="text-purple-500" />} label="Update Profile" indent />
          <NodeItem icon={<FiBell className="text-yellow-500" />} label="Notification" indent />
          <NodeItem icon={<FiLink className="text-red-500" />} label="Webhook" indent />
        </Section>

        {/* Timing Section */}
        <Section 
          title="Timing" 
          isOpen={activeSection === 'timing'}
          onToggle={() => setActiveSection(activeSection === 'timing' ? null : 'timing')}
        >
          <NodeItem icon={<FiClock className="text-orange-500" />} label="Time Delay" />
        </Section>

        {/* Logic Section */}
        <Section 
          title="Logic" 
          isOpen={activeSection === 'logic'}
          onToggle={() => setActiveSection(activeSection === 'logic' ? null : 'logic')}
        >
          <NodeItem icon={<FiCode className="text-indigo-500" />} label="Conditional split" />
        </Section>

        <div className="border-t border-gray-200 pt-3">
          <Section 
            title="Download" 
            isOpen={activeSection === 'download'}
            onToggle={() => setActiveSection(activeSection === 'download' ? null : 'download')}
          >
            <NodeItem icon={<FiDownload className="text-gray-500" />} label="Elsjs - Layout" />
            <NodeItem icon={<FiDownload className="text-gray-500" />} label="Contact" />
          </Section>
        </div>

        {/* Subject Section */}
        <Section 
          title="Subject and sender" 
          isOpen={activeSection === 'subject'}
          onToggle={() => setActiveSection(activeSection === 'subject' ? null : 'subject')}
        >
          <NodeItem label="Subject" />
          <NodeItem label="Variables" />
        </Section>

        {/* Email Section */}
        <div>
          <h3 
            className="font-medium text-gray-700 mb-2 cursor-pointer flex justify-between items-center"
            onClick={() => setActiveSection(activeSection === 'email' ? null : 'email')}
          >
            <span>Sender Email</span>
            <span>{activeSection === 'email' ? '−' : '+'}</span>
          </h3>
          {activeSection === 'email' && (
            <div className="space-y-2">
              <div className="mb-2">
                <p className="text-gray-500 text-xs">Description</p>
                <p className="text-gray-500 text-xs">Variables</p>
              </div>
              <textarea
                className="w-full p-2 border border-gray-200 rounded text-xs h-16"
                placeholder="Enter your description here"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end space-x-2 p-3 border-t border-gray-200 bg-gray-50">
        <button 
          className="px-3 py-1.5 text-gray-700 border border-gray-300 rounded text-xs hover:bg-gray-100"
          onClick={data.onClose}
        >
          Close
        </button>
        <button 
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      {/* React Flow handles */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// Section Component
const Section = ({ title, children, isOpen, onToggle }) => (
  <div>
    <h3 
      className="font-medium text-gray-700 mb-2 cursor-pointer flex justify-between items-center"
      onClick={onToggle}
    >
      <span>{title}</span>
      <span>{isOpen ? '−' : '+'}</span>
    </h3>
    {isOpen && <ul className="space-y-1">{children}</ul>}
  </div>
);

// Node Item Component
const NodeItem = ({ icon, label, indent }) => (
  <li className={`flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer ${indent ? 'ml-4' : ''}`}>
    {icon && <span className="mr-2">{icon}</span>}
    {label}
  </li>
);