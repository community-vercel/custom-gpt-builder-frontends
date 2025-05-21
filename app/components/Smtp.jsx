import React, { useState,useEffect } from 'react';
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import { fetchSmtpConfig, setSmtpConfig } from '../../store/smtpSlice';

export default function SmtpModal({ isOpen, onClose, onSave }) {
  const dispatch = useDispatch();
  const { config: savedConfig } = useSelector((state) => state.smtp);

  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    secure: false,
  });
 const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    }
  });
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
 
  // Sync Redux config into local state
  useEffect(() => {
    if (savedConfig) {
      setSmtpConfig({
        host: savedConfig.host || '',
        port: savedConfig.port || '',
        username: savedConfig.username || '',
        password: savedConfig.password || '',
        secure: savedConfig.secure || false,
      });
    }
  }, [savedConfig]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSmtpConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


 
  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/smtp/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:session?.user?.id, // You can replace this with a real ID from auth context
          ...smtpConfig,
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        alert('SMTP config saved!');
        onSave(smtpConfig);
        onClose();
      } else {
        alert(result.error || 'Failed to save configuration.');
      }
    } catch (error) {
      alert('Error saving configuration.');
    }
  };

  const sendTestEmail = async () => {
    setLoading(true);
    setTestStatus(null);

    try {
        const response = await fetch('http://localhost:5000/api/smtp/send-test-email', {
            method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpConfig),
      });

      const result = await response.json();

      if (response.ok) {
        setTestStatus({ success: true, message: 'Test email sent successfully!' });
      } else {
        setTestStatus({ success: false, message: result.error || 'Failed to send test email.' });
      }
    } catch (err) {
      setTestStatus({ success: false, message: 'Error sending test email.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
<div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center">
<div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">SMTP Configuration</h2>

        <div className="space-y-3">
          <input name="host" value={smtpConfig.host} onChange={handleChange} placeholder="SMTP Host" className="w-full p-2 border rounded" />
          <input name="port" value={smtpConfig.port} onChange={handleChange} placeholder="SMTP Port" className="w-full p-2 border rounded" type="number" />
          <input name="username" value={smtpConfig.username} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded" />
          <input name="password" value={smtpConfig.password} onChange={handleChange} placeholder="Password" type="password" className="w-full p-2 border rounded" />
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="secure" checked={smtpConfig.secure} onChange={handleChange} />
            <span>Use SSL/TLS</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-1">
  Hint: When using Gmail SMTP, for port <strong>465</strong>  set SSL/TLS to <strong>true</strong>.
</p>
        </div>

        {testStatus && (
          <div className={`mt-3 text-sm ${testStatus.success ? 'text-green-600' : 'text-red-600'}`}>
            {testStatus.message}
          </div>
        )}

        <div className="mt-4 flex justify-between items-center gap-2">
          <button
            onClick={sendTestEmail}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}