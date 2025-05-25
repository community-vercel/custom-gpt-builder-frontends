

import {FiSun,FiMoon,FiDroplet} from 'react-icons/fi';

const themes = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      secondary: '#f59e0b',
      success: '#10b981',
      danger: '#ef4444',
      background: '#f9fafb',
      sidebar: '#ffffff',
      text: '#111827',
      border: '#e5e7eb',
    },
    icon: <FiSun className="text-yellow-500" />
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#fbbf24',
      success: '#34d399',
      danger: '#f87171',
      background: '#1f2937',
      sidebar: '#111827',
      text: '#f3f4f6',
      border: '#374151',
    },
    icon: <FiMoon className="text-indigo-300" />
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#06b6d4',
      secondary: '#0ea5e9',
      success: '#14b8a6',
      danger: '#f43f5e',
      background: '#f0f9ff',
      sidebar: '#e0f2fe',
      text: '#082f49',
      border: '#bae6fd',
    },
    icon: <FiDroplet className="text-cyan-500" />
  }
};