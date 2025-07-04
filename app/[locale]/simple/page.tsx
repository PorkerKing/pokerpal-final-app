'use client';

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { LogIn, User, Spade } from 'lucide-react';

export default function SimplePage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // Simple mounting check
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0D0F18] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0D0F18] flex items-center justify-center">
        <div className="text-white">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0F18] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            🎰 PokerPal AI Assistant
          </h1>
          
          <div className="bg-white/10 rounded-lg p-8 mb-8">
            <h2 className="text-2xl mb-4">Deployment Test</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold mb-2">Authentication Status:</h3>
                <p className="text-gray-300">
                  Status: {status}<br/>
                  User: {session?.user?.email || 'Not logged in'}
                </p>
                
                {!session?.user && (
                  <button
                    onClick={() => signIn('github')}
                    className="mt-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <LogIn size={16} />
                    Login with GitHub
                  </button>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Environment:</h3>
                <p className="text-gray-300">
                  Mode: {process.env.NODE_ENV || 'unknown'}<br/>
                  Has Auth URL: {process.env.NEXTAUTH_URL ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 p-6 rounded-lg">
              <Spade className="w-8 h-8 text-purple-400 mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Tournaments</h3>
              <p className="text-gray-400 text-sm">Manage poker tournaments</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-lg">
              <User className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Members</h3>
              <p className="text-gray-400 text-sm">Club member management</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-lg">
              <LogIn className="w-8 h-8 text-green-400 mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Settings</h3>
              <p className="text-gray-400 text-sm">Configure your club</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              PokerPal v1.2 - Professional Poker Club Management Platform
            </p>
            
            {session?.user ? (
              <div className="space-y-2">
                <p className="text-green-400">✅ Successfully deployed and authenticated!</p>
                <a 
                  href="/zh/dashboard" 
                  className="inline-block bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </a>
              </div>
            ) : (
              <p className="text-yellow-400">Please login to access full features</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

