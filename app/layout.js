// app/layout.js
'use client';

import "../app/globals.css";
import { Toaster } from 'react-hot-toast'; // Ensure react-hot-toast is imported
import DashboardLayout from "./components/DashboardLayout";
import { AppProviders } from "./providers";



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
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
                    border: '1px solid #dc3545', // Red border for errors
                  },
                },
              }}
            />
          </DashboardLayout>
        </AppProviders>
      </body>
    </html>
  );
}