'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(null); // Store token in state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);

  // Extract token after searchParams is available
  useEffect(() => {
    const tokenValue = searchParams.get('token');
    console.log('Token from searchParams:', tokenValue); // Debugging
    setToken(tokenValue);
  }, [searchParams]);

  // Validate token and handle redirect
  useEffect(() => {
    if (!token) {
      if (token === null) return; // Wait for token to be set
      toast.error('Invalid reset link');
      router.push('/login');
      return;
    }

    // Validate token with backend
    const validateToken = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        console.log('Token validation response:', data); // Debugging
        if (res.ok) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          toast.error(data.message || 'Invalid or expired reset link');
          router.push('/login');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setIsValidToken(false);
        toast.error('An error occurred while validating the reset link');
        router.push('/login');
      }
    };

    validateToken();
  }, [token, router]);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset successful! You can now log in.');
        router.push('/login');
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred while resetting your password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null || isValidToken === false) {
    return null; // Show nothing while validating or if invalid
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Reset Password</h1>
        <div className="space-y-4">
          <div className="relative">
            <FaLock className="absolute top-3.5 left-3 text-blue-500" />
            <input
              type="password"
              className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
              placeholder="New Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-3.5 left-3 text-blue-500" />
            <input
              type="password"
              className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
          </div>
          <button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-medium flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              'Reset Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}