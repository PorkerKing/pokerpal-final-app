'use client';

export default function DebugPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Deployment Debug Info</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Environment Check</h2>
          <pre className="text-sm">
            {JSON.stringify({
              NODE_ENV: process.env.NODE_ENV,
              NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
              hasDatabase: !!process.env.DATABASE_URL,
              hasAuthSecret: !!process.env.NEXTAUTH_SECRET,
              hasGithubAuth: !!process.env.GITHUB_CLIENT_ID,
            }, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Client Info</h2>
          <pre className="text-sm">
            {JSON.stringify({
              userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
              host: typeof window !== 'undefined' ? window.location.host : 'SSR',
              protocol: typeof window !== 'undefined' ? window.location.protocol : 'SSR',
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}