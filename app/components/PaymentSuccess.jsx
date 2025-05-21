'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/stripe/verify-payment?session_id=${sessionId}`
        );
        setPaymentStatus(data.status);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus('failed');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {paymentStatus === 'success' ? (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <FiCheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="mt-2 text-gray-600">
              Thank you for your purchase. Your subscription is now active.
            </p>
            <div className="mt-6">
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Go to Dashboard
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <FiXCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Failed</h2>
            <p className="mt-2 text-gray-600">
              We couldn't process your payment. Please try again.
            </p>
            <div className="mt-6">
              <a
                href="/packages"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Packages
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}