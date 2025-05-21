// pages/success.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Optionally, verify the session ID with your backend
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (sessionId) {
      // Call your backend to confirm the payment (optional)
      console.log('Session ID:', sessionId);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-400 mb-4">Payment Successful!</h1>
        <p className="text-gray-300 mb-6">Thank you for your purchase. You'll receive a confirmation soon.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}