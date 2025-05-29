'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { FaCheck, FaBolt, FaStar, FaCrown, FaGem } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [content, setContent] = useState(null);
  
  const [userSubscription, setUserSubscription] = useState(null);
  
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();

  const enhancePackages = (apiPackages) => {
    const icons = [<FaStar className="text-amber-400" />, <FaCrown className="text-purple-400" />, <FaGem className="text-teal-400" />];
    const accents = ['from-amber-400 to-yellow-500', 'from-purple-500 to-indigo-600', 'from-emerald-400 to-cyan-500'];

    return apiPackages.map((pkg, index) => ({
      ...pkg,
      icon: icons[index % icons.length],
      accent: accents[index % accents.length],
      popular: pkg.name.trim().toLowerCase() === 'core',
      name: pkg.name.trim(),
      features: pkg.features.map((f) => f.trim()),
    }));
  };

  useEffect(() => {
    fetchPackages();
    if (userId) {
      fetchSubscription();
      fetchContent();
    }

    // Check for session_id in URL (post-checkout redirect)
  
  }, [userId]);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/package/getpackages');
      setPackages(enhancePackages(data));
      setError('');
    } catch (err) {
      setError('Failed to fetch packages');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/package/getpackage?userId=${session.user?.id}`);
        setUserSubscription(data.userPackage || null);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setUserSubscription(null);
    }
  };

  const fetchContent = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/protected/protected-content', {
        params: { userId },
      });
      setContent(data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load content');
    }
  };

  // const verifyCheckoutSession = async (sessionId) => {
  //   try {
  //     setIsLoading(true);
  //     // Poll subscription status
  //     let attempts = 0;
  //     const maxAttempts = 5;
  //     let subscription = null;

  //     while (attempts < maxAttempts) {
  //       const { data } = await axios.get('http://localhost:5000/api/subscription/get-subscription', {
  //         params: { userId },
  //       });
  //       subscription = data.subscription;
  //       if (subscription && subscription.status === 'active') {
  //         break;
  //       }
  //       await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
  //       attempts++;
  //     }

  //     if (subscription && subscription.status === 'active') {
  //       setUserSubscription(subscription);
  //       setError('');
  //       router.replace('/packages'); // Clear session_id from URL
  //     } else {
  //       setError('Subscription activation failed. Please try again or contact support.');
  //     }
  //   } catch (err) {
  //     setError('Failed to verify checkout session');
  //     console.error('Verify checkout error:', err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSelectPackage = (pkg) => {
    if (userSubscription) {
      setError('You are already subscribed to a package. Please cancel your current subscription to choose a new one.');
      return;
    }
    setSelectedPackage(pkg.packageId);
  };

  const handlePayment = async () => {
    if (!selectedPackage) {
      setError('Please select a package');
      return;
    }

    try {
      setIsProcessingPayment(true);
      setError('');

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { data } = await axios.post('http://localhost:5000/api/package/stripe/create-checkout-session', {
        packageId: selectedPackage,
        userId,
      });

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment processing failed');
      console.error('Payment error:', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
        <FiLoader className="animate-spin text-5xl text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold text-white sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
            Choose Your Hosting Plan
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 max-w-2xl mx-auto text-xl text-gray-300 leading-relaxed"
          >
            Find the perfect plan to power your website and engage your audience.
          </motion.p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-4 mb-10 rounded-lg shadow-md"
          >
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {userSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-indigo-900/50 border-l-4 border-indigo-500 text-indigo-200 p-4 mb-10 rounded-lg shadow-md text-center"
          >
            <p className="font-medium">
              You are currently subscribed to the {userSubscription.name} .{' '}
              <Link href="#" className="underline hover:text-indigo-100">
                Manage your subscription
              </Link>
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.packageId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className={`relative bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${
                selectedPackage === pkg.packageId
                  ? 'ring-4 ring-indigo-400 scale-[1.03] shadow-2xl'
                  : userSubscription?.packageId === pkg.packageId
                  ? 'ring-4 ring-green-400'
                  : pkg.popular
                  ? 'ring-2 ring-purple-400'
                  : 'border border-gray-700'
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold py-2 text-center uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              {userSubscription?.packageId === pkg.packageId && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold py-2 text-center uppercase tracking-wider">
                  Active Plan
                </div>
              )}
              <div className="p-8 h-full">
                <div className="flex items-center mb-6">
                  <div className={`text-4xl bg-gradient-to-r ${pkg.accent} p-3 rounded-lg`}>{pkg.icon}</div>
                  <h3 className="text-2xl font-bold text-white ml-4">{pkg.name}</h3>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-white">${pkg.price}</span>
                  <span className="text-gray-400 text-xl">/{pkg.billingPeriod}</span>
                  <p className="text-gray-400 mt-1">billed {pkg.billingPeriod === 'year' ? 'annually' : 'monthly'}</p>
                  <p className="text-sm text-gray-500">Flows Allowed: {pkg.flowsAllowed}</p>
                </div>
                <p className="text-gray-300 mb-6">{pkg.description.replace(/\n/g, ' ')}</p>
                <ul className="space-y-4 mb-10">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <FaCheck className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  onClick={() => handleSelectPackage(pkg)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={userSubscription !== null}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all shadow-md ${
                    userSubscription?.packageId === pkg.packageId
                      ? 'bg-green-600 cursor-not-allowed'
                      : selectedPackage === pkg.packageId
                      ? `bg-gradient-to-r ${pkg.accent} hover:shadow-lg`
                      : pkg.popular
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:shadow-purple-lg'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {userSubscription?.packageId === pkg.packageId ? (
                    <>
                      <FaCheck className="mr-2 h-5 w-5" /> Active
                    </>
                  ) : selectedPackage === pkg.packageId ? (
                    <>
                      <FaCheck className="mr-2 h-5 w-5" /> Selected
                    </>
                  ) : (
                    `Select ${pkg.name}`
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
        {selectedPackage && !userSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 text-center space-y-6"
          >
            <motion.button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex items-center px-8 py-4 rounded-xl text-xl font-semibold text-white shadow-lg transition-all duration-300 ${
                isProcessingPayment
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <FiLoader className="animate-spin mr-3 h-6 w-6" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <FaBolt className="ml-3 h-6 w-6" />
                </>
              )}
            </motion.button>
            <div className="inline-flex items-center px-6 py-3 bg-gray-800 rounded-full text-sm font-medium text-gray-300 border border-gray-700">
              <FaBolt className="mr-2 text-yellow-400" />
              <span>
                All plans come with a <span className="font-bold text-white">30-day</span> money-back guarantee
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}