// pages/cancel.js
'use client';
import { useRouter } from 'next/navigation';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-400 mb-4">Payment Canceled</h1>
        <p className="text-gray-300 mb-6">Your payment was not completed. Please try again.</p>
        <button
          onClick={() => router.push('/packages')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Packages
        </button>
      </div>
    </div>
  );
}