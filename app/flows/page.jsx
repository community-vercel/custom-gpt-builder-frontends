'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiFolder,
  FiPlus,
 
  FiSearch,
  FiFilter,
  FiZap,
  FiBarChart2,
  
  FiChevronDown,
  FiCheck,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { loadFlows, deleteFlow, setCurrentFlow, loadFlows2 } from '../../store/flowBuilderSlice';
import Link from 'next/link';

import FlowCard from '../components/Flowcard';

export default function FlowsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const dispatch = useDispatch();
  const flows = useSelector((state) => state.flowBuilder.flows);
  const loading = useSelector((state) => state.flowBuilder.status === 'loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recent');
  const [showSortOptions, setShowSortOptions] = useState(false);
console.log("flows",flows)
  useEffect(() => {
    if (session?.user?.id) {
      dispatch(loadFlows2(session.user.id));
    }
  }, [session?.user?.id, dispatch]);

  const handleDeleteFlow = async (flowId) => {
    try {
      await dispatch(deleteFlow({ userId: session.user.id, flowId })).unwrap();
    } catch (error) {
      alert('Failed to delete flow: ' + error.message);
    }
  };

  const filteredFlows = flows
    .filter((flow) => {
      const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && flow.isActive) ||
        (filter === 'inactive' && flow.isActive);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortOption === 'recent') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'node') {
        return (b.node || 0) - (a.node || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/0 to-white/20 opacity-0 animate-shine"></div>
            <FiZap className="text-white text-3xl" />
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-gray-700 font-medium text-lg"
          >
            Loading your flows...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className=" bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6"
        >
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Automation Flows
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              {flows.length} {flows.length === 1 ? 'flow' : 'flows'} •{' '}
              <span className="text-green-500 font-medium">
                {flows.filter((f) => f).length} active
              </span>{' '}
              •{' '}
              <span className="text-blue-500 font-medium">
                {flows.reduce((acc, flow) => acc + (flow.nodesCount || 0), 0)} total nodes
              </span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-sm"
                placeholder="Search flows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 text-sm min-w-[120px]"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Flows</option>
                  {/* <option value="active">Active</option>
                  <option value="inactive">Inactive</option> */}
                </select>
                <FiFilter className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <button
                  className="flex items-center pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 text-sm min-w-[120px]"
                  onClick={() => setShowSortOptions(!showSortOptions)}
                >
                  <span>Sort: {sortOption === 'recent' ? 'Recent' : sortOption === 'name' ? 'Name' : 'Node'}</span>
                  <FiChevronDown
                    className={`absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 transition-transform ${
                      showSortOptions ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {showSortOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1 w-full bg-white rounded-xl shadow-lg z-10 border border-gray-100 overflow-hidden"
                    >
                      <button
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${
                          sortOption === 'recent' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        } hover:bg-gray-50 transition-colors duration-200`}
                        onClick={() => {
                          setSortOption('recent');
                          setShowSortOptions(false);
                        }}
                      >
                        <span>Recent</span>
                        {sortOption === 'recent' && <FiCheck className="text-blue-600" />}
                      </button>
                      <button
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${
                          sortOption === 'name' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        } hover:bg-gray-50 transition-colors duration-200 border-t border-gray-100`}
                        onClick={() => {
                          setSortOption('name');
                          setShowSortOptions(false);
                        }}
                      >
                        <span>Name</span>
                        {sortOption === 'name' && <FiCheck className="text-blue-600" />}
                      </button>
                      <button
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${
                          sortOption === 'edges' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        } hover:bg-gray-50 transition-colors duration-200 border-t border-gray-100`}
                        onClick={() => {
                          setSortOption('node');
                          setShowSortOptions(false);
                        }}
                      >
                        <span>Nodes</span>
                        {sortOption === 'edfes' && <FiCheck className="text-blue-600" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
           
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredFlows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-indigo-400 rounded-full filter blur-3xl"></div>
            </div>
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FiFolder className="text-5xl text-blue-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {searchQuery ? 'No matching flows found' : 'Start Automating Today'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm">
              {searchQuery
                ? 'Try adjusting your search or filter criteria to find your flows.'
                : 'Create your first automation flow to streamline your workflows and boost productivity.'}
            </p>
            <Link
              href="/chatbot"
              onClick={() => dispatch(setCurrentFlow(null))}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium text-sm group/empty relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/0 to-white/20 opacity-0 group-hover/empty:opacity-100 transition-opacity duration-500"></div>
              <motion.span whileHover={{ scale: 1.05 }} className="flex items-center">
                <FiPlus className="mr-2 transition-transform group-hover/empty:rotate-90" /> Create First Flow
              </motion.span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredFlows.map((flow) => (
                <FlowCard
                  key={flow._id}
                  flow={flow}
                  onDelete={handleDeleteFlow}
                  userId={session?.user?.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}