// app/login/page.js
'use client';
import { signIn } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaGoogle, FaPaperPlane } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(null); // null = unknown, true = verified, false = unverified

  // Handle query parameters and session
  useEffect(() => {
    const verified = searchParams.get('verified');
    const errorParam = searchParams.get('error');

    if (verified === 'true') {
      setMessage('Email verified successfully! Please log in.');
      setError('');
    }
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setMessage('');
    }

    if (session && status === 'authenticated') {
      dispatch(
        setCredentials({
          token: session.user.token,
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            active: session.user.active,
            isVerified: session.user.isVerified,
          },
        })
      );
      router.push('/dashboard');
    }
  }, [status, session, router, dispatch, searchParams]);

  // Check email verification status
  const checkVerificationStatus = useCallback(async () => {
    if (!email) {
      setIsVerified(null);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setIsVerified(data.user.isVerified);
      } else {
        setIsVerified(null); // Reset if user not found
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setIsVerified(null);
    }
  }, [email]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      checkVerificationStatus();
    }, 500); // Debounce to avoid excessive API calls

    return () => clearTimeout(debounce);
  }, [email, checkVerificationStatus]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push('/dashboard');
    } else {
      setError(res?.error || 'Invalid email or password');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    setMessage('');
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      setError('Failed to login with Google');
    }
    setGoogleLoading(false);
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email to resend the verification link.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Verification email resent successfully! Please check your inbox.');
      } else {
        setError(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('An error occurred while resending the verification email');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md animate-fade-in-up transform transition-all duration-500">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6 tracking-wide animate-fade-in">
          👋 Welcome Back!
        </h1>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center animate-fade-in flex items-center justify-center gap-2">
            <span>{message}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center animate-fade-in flex items-center justify-center gap-2">
            <span>{error}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}

        <div className="space-y-5">
          <div className="relative group">
            <FaEnvelope className="absolute top-3.5 left-3 text-blue-500 group-focus-within:text-blue-700 transition" />
            <input
              type="email"
              className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div className="relative group">
            <FaLock className="absolute top-3.5 left-3 text-blue-500 group-focus-within:text-blue-700 transition" />
            <input
              type="password"
              className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg font-semibold flex items-center justify-center shadow-lg transition-all duration-300 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              'Login'
            )}
          </button>

          {isVerified === false && (
            <button
              onClick={handleResendVerification}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              ) : (
                <>
                  <FaPaperPlane className="text-white" />
                  Resend Verification Email
                </>
              )}
            </button>
          )}

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-3 shadow transition-all duration-300 disabled:opacity-70"
          >
            {googleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-500"></div>
            ) : (
              <>
                <FaGoogle className="text-red-500 text-lg" />
                Continue with Google
              </>
            )}
          </button>
        </div>

        <p className="text-center text-gray-600 mt-6 animate-fade-in">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="text-blue-600 font-semibold hover:underline transition"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}