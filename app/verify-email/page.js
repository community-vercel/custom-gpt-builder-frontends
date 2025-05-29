'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid verification link');
      router.push('/login');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Email verified! You can now log in.');
          router.push('/login');
        } else {
          toast.error(data.message || 'Failed to verify email');
          router.push('/login');
        }
      } catch (error) {
        toast.error('An error occurred while verifying your email');
        router.push('/login');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          {isVerifying ? 'Verifying Email...' : 'Email Verification'}
        </h1>
        {isVerifying && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}