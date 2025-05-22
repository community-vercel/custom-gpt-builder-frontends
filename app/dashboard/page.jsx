"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  FaUser, 
  FaEnvelope, 
  FaRobot, 
  FaListAlt, 
  FaMoneyBillWave,
  FaChartLine,
  FaCog,
  FaBell,
  FaSearch
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import LogoutButton from "../components/Logout";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    document.title = "Analytics Dashboard";
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="  py-0 px-0 sm:px-6">
      {/* Header */}
   
      {/* Main Content */}
      <div className="max-w-8xl mx-auto mt-16 backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/50">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
              Welcome back, <span className="text-blue-600">{session?.user?.name?.split(" ")[0] || 'User'}</span>!
            </h1>
            <p className="text-lg text-gray-600 mt-2">Here's what's happening with your flows today</p>
          </div>
         
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {['overview', 'analytics', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm sm:text-base relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Dashboard Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* User Profile Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-blue-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-3">
                  <FaUser className="text-blue-500" /> Profile Overview
                </h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Basic Plan
                </span>
              </div>
              <div className="space-y-5 text-gray-700">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-lg font-semibold">{session?.user?.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-lg font-semibold">{session?.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-green-100 hover:shadow-xl transition-all"
            >
              <h2 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-3">
                <FaRobot className="text-green-500" /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <Link
                  href="/chatbot"
                  className="flex items-center justify-between gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all group"
                >
                  <span className="font-medium">Create New Flow</span>
                  <FaRobot className="transition-transform group-hover:scale-110" />
                </Link>
                <Link
                  href="/flows"
                  className="flex items-center justify-between gap-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all group"
                >
                  <span className="font-medium">View All Flows</span>
                  <FaListAlt className="transition-transform group-hover:scale-110" />
                </Link>
                <Link
                  href="/packages"
                  className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all group"
                >
                  <span className="font-medium">Upgrade Plan</span>
                  <FaMoneyBillWave className="transition-transform group-hover:scale-110" />
                </Link>
              </div>
            </motion.div>

            {/* Analytics Card (shown when analytics tab is active) */}
            {activeTab === 'analytics' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="md:col-span-2 bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-purple-100"
              >
                <h2 className="text-2xl font-bold mb-6 text-purple-700 flex items-center gap-3">
                  <FaChartLine className="text-purple-500" /> Usage Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <p className="text-sm text-blue-600">Total Flows</p>
                    <p className="text-3xl font-bold text-blue-800">12</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl">
                    <p className="text-sm text-green-600">Active Flows</p>
                    <p className="text-3xl font-bold text-green-800">8</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl">
                    <p className="text-sm text-purple-600">Messages Sent</p>
                    <p className="text-3xl font-bold text-purple-800">1,243</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings Card (shown when settings tab is active) */}
            {activeTab === 'settings' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="md:col-span-2 bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-gray-200"
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-700 flex items-center gap-3">
                  <FaCog className="text-gray-500" /> Account Settings
                </h2>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-800 mb-2">Notification Preferences</h3>
                    <p className="text-sm text-gray-600">Manage how you receive notifications</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-800 mb-2">Security Settings</h3>
                    <p className="text-sm text-gray-600">Update password and security questions</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-800 mb-2">Billing Information</h3>
                    <p className="text-sm text-gray-600">View and update payment methods</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}