'use client';

import '../app/globals.css';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './components/DashboardLayout';
import { AppProviders } from './providers';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isChatbotPage = pathname === '/chatbot';
  const isSignuupPage = pathname === '/signup';

  return (
    <html lang="en">
      
      <body>
        <AppProviders>
          {isLoginPage || isChatbotPage || isSignuupPage ? (
            <>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: '#f8f9fa',
                    color: '#212529',
                    border: '1px solid #007bff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  },
                  error: {
                    style: {
                      border: '1px solid #dc3545',
                    },
                  },
                }}
              />
            </>
          ) : (
            <DashboardLayout>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: '#f8f9fa',
                    color: '#212529',
                    border: '1px solid #007bff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  },
                  error: {
                    style: {
                      border: '1px solid #dc3545',
                    },
                  },
                }}
              />
            </DashboardLayout>
          )}
        </AppProviders>
      </body>
    </html>
  );
}