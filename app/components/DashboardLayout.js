'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FiHome,
  FiMessageSquare,
  FiZap,
  FiSettings,
  FiUsers,
  FiDatabase,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiFolder,
  FiGlobe,
  FiBarChart2,
  FiHelpCircle,
  FiBell,
  FiSearch,
  FiUser,
  FiCog
} from 'react-icons/fi';
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { AppProviders } from '../providers';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
 
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
const isChatbotPage = pathname===('/chatbot') 



// Check if the current page is a chatbot page
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoginPage || 
    isChatbotPage ) {
    return <AppProviders>{children}</AppProviders>;
  }
 
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const navItems = [
    { name: 'Dashboard', icon: <FiHome />, path: '/dashboard' },
    { name: 'Flows', icon: <FiZap />, path: '/flows' },
    { name: 'Chatbot', icon: <FiMessageSquare />, path: '/chatbots' },
    { name: 'Templates', icon: <FiFolder />, path: '/templates' },
    { name: 'Integrations', icon: <FiGlobe />, path: '/integrations' },
    { name: 'Analytics', icon: <FiBarChart2 />, path: '/analytics' },
    { name: 'Team', icon: <FiUsers />, path: '/team' },
    { name: 'Settings', icon: <FiSettings />, path: '/settings' },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isMobile ? (mobileSidebarOpen ? 0 : '-100%') : 0,
          width: sidebarOpen ? '16rem' : '5rem'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed lg:relative z-30 bg-white shadow-xl transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          h-full flex-shrink-0 rounded-r-2xl overflow-hidden border-r border-gray-100`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {sidebarOpen ? (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-2 shadow-md">
                  <span className="text-white font-bold text-xs">FB</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  FlowBuilder
                </h1>
              </motion.div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs">FB</span>
              </div>
            )}
            <button 
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 transition-all"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <motion.li 
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  onHoverStart={() => setActiveHover(item.name)}
                  onHoverEnd={() => setActiveHover(null)}
                >
                  <Link
                    href={item.path}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 relative
                      ${pathname.startsWith(item.path) ? 
                        'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-l-4 border-blue-500 font-semibold' : 
                        'text-gray-600 hover:bg-gray-50'}
                      ${!sidebarOpen ? 'justify-center' : ''}`}
                  >
                    <span className={`text-lg ${pathname.startsWith(item.path) ? 'text-blue-500' : 'text-gray-500'}`}>
                      {item.icon}
                    </span>
                    {sidebarOpen && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-3 font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                    {activeHover === item.name && !sidebarOpen && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute left-full ml-2 px-3 py-1 bg-white shadow-md rounded-md text-sm font-medium whitespace-nowrap border border-gray-100 z-50"
                      >
                        {item.name}
                        <div className="absolute w-3 h-3 bg-white transform rotate-45 -left-1.5 top-1/2 -translate-y-1/2 border-l border-t border-gray-100" />
                      </motion.div>
                    )}
                    {pathname.startsWith(item.path) && !sidebarOpen && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              href="/help"
              className={`flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all
                ${!sidebarOpen ? 'justify-center' : ''}`}
            >
              <span className="text-lg text-gray-500"><FiHelpCircle /></span>
              {sidebarOpen && <span className="ml-3 font-medium">Help Center</span>}
            </Link>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all
                ${!sidebarOpen ? 'justify-center' : ''}`}
            >
              <span className="text-lg text-gray-500"><FiLogOut /></span>
              {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <motion.header 
          animate={{
            boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
            backdropFilter: isScrolled ? 'blur(10px)' : 'none',
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 1)'
          }}
          className="sticky top-0 z-10 border-b border-gray-200 py-3 px-6 flex items-center justify-between transition-all"
        >
          <div className="flex items-center">
            <button 
              onClick={toggleMobileSidebar}
              className="lg:hidden mr-4 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Search bar */}
      
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
          
            
            {/* User dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 focus:outline-none" aria-label="User menu">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
                {sidebarOpen && (
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-gray-800">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.email || 'Admin'}
                    </p>
                  </div>
                )}
              </button>
              
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{session?.user?.email || 'Admin'}</p>
                </div>
                <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <FiUser className="mr-3 text-gray-500" /> Your Profile
                </Link>
                <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <FiSettings className="mr-3 text-gray-500" /> Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  <FiLogOut className="mr-3 text-gray-500" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Breadcrumbs */}
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <Link href="/dashboard" className="hover:text-blue-500 transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-700 font-medium">{pathname.split('/')[1]}</span>
              </div>
              
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}