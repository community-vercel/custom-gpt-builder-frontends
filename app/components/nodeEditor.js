    <div className="w-1/3 p-5 border-l overflow-y-auto transition-colors duration-300"
     style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text)' }}>
  <h2 className="text-xl font-bold mb-4">Chatbot Preview</h2>
  <div className="bg-white p-4 rounded shadow" style={{ minHeight: '200px' }}>
    {/* Chat header similar to the Laura example */}
    <div className="mb-4 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="font-bold">Laura</div>
      <div className="text-xs text-gray-500">May 8th at 10:01 AM</div>
    </div>
    
    {/* First message */}
    <div className="mb-3 p-3 rounded-lg bg-gray-100">
      Hi there! What can I help you with?
    </div>
    
    {/* Second message with options */}
    <div className="mb-3 p-3 rounded-lg bg-gray-100">
      What brought you to our website today?
      <div className="mt-2 space-y-1">
        {nodes.map((node) => (
          <div key={node.id} className="text-sm p-2 hover:bg-gray-200 rounded cursor-pointer border" 
               style={{ borderColor: 'var(--border)' }}>
            {node.data.label}
            
            {/* Show options if this is a custom node with options */}
            {node.type === 'custom' && node.data.options?.length > 0 && (
              <div className="mt-1 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                {node.data.options.map((opt, i) => (
                  <div key={i} className="text-xs py-1">• {opt}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    
    {/* Dynamic nodes preview */}
    {/* <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
      {nodes.map((node) => (
        <div key={node.id} className="mb-2 p-2 border rounded text-sm" style={{ borderColor: 'var(--border)' }}>
          <strong>{node.type.toUpperCase()}</strong>
          <div>{node.data.label}</div>

          {node.type === 'custom' && node.data.options?.map((opt, i) => (
            <div key={i} className="text-xs text-gray-600 mt-1">Option: {opt}</div>
          ))}
          {node.type === 'webhook' && (
            <div className="text-xs text-gray-600 mt-1">POST to {node.data.url}</div>
          )}
          {node.type === 'form' && node.data.fields?.map((field, i) => (
            <div key={i} className="text-xs mt-1">
              <label>{field.label}: <input type={field.type} placeholder={field.label} className="ml-1 border-b border-gray-300 w-3/4" /></label>
            </div>
          ))}
        </div>
      ))}
    </div> */}
  </div>
</div>