'use client';
import { signIn } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { Toaster, toast } from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error'); // Get error from query params

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const recaptchaRef = useRef(null);

  // Handle errors from query params
  useEffect(() => {
    if (error) {
      toast.error(decodeURIComponent(error), { duration: 5000 });
    }
  }, [error]);

  // Handle session status and redirect
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated' && session) {
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
      router.push(callbackUrl);
    }
  }, [status, session, router, dispatch, callbackUrl]);

  // Execute reCAPTCHA programmatically
  const executeRecaptcha = async () => {
    if (!recaptchaRef.current) {
      toast.error('reCAPTCHA not loaded. Please try again.');
      return null;
    }
    try {
      const token = await recaptchaRef.current.executeAsync();
      if (!token) {
        toast.error('reCAPTCHA verification failed. Please try again.');
        return null;
      }
      return token;
    } catch (err) {
      console.error('reCAPTCHA error:', err);
      toast.error('Failed to execute reCAPTCHA. Please try again.');
      return null;
    }
  };

  const handleLogin = async () => {
    const token = await executeRecaptcha();
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        recaptchaToken: token,
        redirect: false,
      });

      if (res?.ok) {
        toast.success('Login successful! Redirecting...', { duration: 3000 });
      } else {
        toast.error(res?.error || 'Invalid email or password', { duration: 5000 });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'An error occurred during login', { duration: 5000 });
    } finally {
      setIsLoading(false);
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to login with Google', { duration: 5000 });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address', { duration: 5000 });
      return;
    }

    const token = await executeRecaptcha();
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail, recaptchaToken: token }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset email sent! Please check your inbox.', { duration: 5000 });
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      } else {
        toast.error(data.message || 'Failed to send reset email', { duration: 5000 });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'An error occurred while sending the reset email', {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  };

  const onReCAPTCHAChange = (token) => {
    setRecaptchaToken(token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md animate-fade-in-up transform transition-all duration-500">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6 tracking-wide animate-fade-in">
          👋 Welcome Back!
        </h1>

        {showForgotPassword ? (
          <>
            <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
              Reset Password
            </h2>
            <div className="space-y-5">
              <div className="relative group">
                <FaEnvelope className="absolute top-3.5 left-3 text-blue-500 group-focus-within:text-blue-700 transition" />
                <input
                  type="email"
                  className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                  placeholder="Enter your email"
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  value={forgotPasswordEmail}
                />
              </div>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                size="invisible"
                onChange={onReCAPTCHAChange}
              />
              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg font-semibold flex items-center justify-center shadow-lg transition-all duration-300 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                ) : (
                  'Send Reset Email'
                )}
              </button>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-blue-600 font-semibold hover:underline transition"
              >
                Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
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

              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                size="invisible"
                onChange={onReCAPTCHAChange}
              />

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

              <button
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-blue-600 font-semibold hover:underline transition"
              >
                Forgot Password?
              </button>

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
          </>
        )}
      </div>
    </div>
  );
}