// app/widget/[userId]/[flowId]/page.jsx
import ChatbotPreview from '../../../components/ChatbotPreview';
import { notFound } from 'next/navigation';
    
async function fetchFlow(userId, flowId) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/flow/${userId}/${flowId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error('Flow not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching flow:', error);
    return null;
  }
}

export default async function WidgetPage({ params }) {
  const { userId, flowId } = params;
  const flow = await fetchFlow(userId, flowId);

  if (!flow) {
    notFound();
  }

  return (
    <div className="w-full h-full">
      <ChatbotPreview nodes={flow.nodes} edges={flow.edges} />
    </div>
  );
}