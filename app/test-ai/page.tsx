"use client";

import { useState } from 'react';

export default function TestAI() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testAI = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          history: [],
          clubId: 'guest-shanghai',
          locale: 'zh',
          userId: null,
          conversationId: 'test-' + Date.now()
        }),
      });

      const data = await res.json();
      setResponse(data.reply || data.message || 'No response');
    } catch (error) {
      setResponse('Error: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">AI功能测试</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">测试消息:</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              placeholder="输入测试消息..."
            />
          </div>
          
          <button
            onClick={testAI}
            disabled={loading || !message.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试AI'}
          </button>
          
          {response && (
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">AI回复:</label>
              <div className="bg-gray-800 border border-gray-600 rounded p-4">
                <pre className="whitespace-pre-wrap text-sm">{response}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}