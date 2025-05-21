// components/EmbedWidget.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { FiCode, FiCopy } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import ChatbotPreview from './ChatbotPreview';

export default function EmbedWidget({ nodes, edges, flowId }) {
  const { data: session } = useSession();
  const [embedCode, setEmbedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (session?.user?.id && flowId) {
      const baseUrl =  'http://localhost:3000';
      const iframeCode = `
        <iframe
          src="${baseUrl}/widget/${session.user.id}/${flowId}"
          width="100%"
          height="500px"
          frameborder="0"
          style="border-radius: 8px;"
          allow="clipboard-write"
        ></iframe>
      `;
      setEmbedCode(iframeCode.trim());
    }
  }, [session?.user?.id, flowId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-[var(--background)]">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FiCode className="text-[var(--primary)]" /> Embed Widget
      </h3>
      {embedCode ? (
        <div className="space-y-4">
          <div className="relative">
            <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={handleCopyCode}
              className="absolute top-2 right-2 p-2 rounded-md bg-[var(--primary)] text-white hover:bg-[var(--secondary)] transition"
            >
              {isCopied ? 'Copied!' : <FiCopy />}
            </button>
          </div>
          <div className="mt-4">
            <h4 className="text-md font-medium mb-2">Widget Preview</h4>
            <div className="border rounded-lg p-2" style={{ height: '500px' }}>
              <ChatbotPreview nodes={nodes} edges={edges} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--text)] opacity-80">
          Save the flow to generate the embed code.
        </p>
      )}
    </div>
  );
}