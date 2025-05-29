'use client';
import { useSession, signIn } from 'next-auth/react';
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import FlowBuilder from '../components/FlowBuilder';

export default function ChatbotFlowPage() {
  const { data: session, status } = useSession();

useEffect(() => {
  if (status === 'loading') {
    // Force fetch session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          signIn('credentials', { callbackUrl: '/chatbot' });
        }
      });
  }
}, [status]);

  return (
    <ReactFlowProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <FlowBuilder />
      </Suspense>
    </ReactFlowProvider>
  );
}