import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const seedEndpoints = ['clear', 'users', 'jobs', 'applications'] as const;

// Hardcoded for now
const fakeCurrentUser = { email: 'admin@gradsearch.com' };
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gradsearch.com';

export default function SeedDashboard() {
  const [results, setResults] = useState<Record<string, string>>({});

  if (fakeCurrentUser.email !== adminEmail) {
    return <div className="text-center text-red-500 mt-10">Access denied</div>;
  }

  const triggerSeed = async (route: string) => {
    setResults((prev) => ({ ...prev, [route]: 'Loading...' }));

    try {
      const res = await fetch(`/api/seed/${route}`, { method: 'POST' });
      const data = await res.json();
      setResults((prev) => ({ ...prev, [route]: JSON.stringify(data, null, 2) }));
    } catch (err) {
      setResults((prev) => ({ ...prev, [route]: 'Error triggering seed' }));
    }
  };

  return (
    <main className="max-w-3xl mx-auto mt-10 p-4 space-y-6">
      <h1 className="text-2xl font-bold">🧪 Seed Dashboard</h1>

      <Card>
        <CardContent className="space-y-4 py-4">
          {seedEndpoints.map((route) => (
            <div key={route} className="space-y-2">
              <Button onClick={() => triggerSeed(route)}>
                Trigger /api/seed/{route}
              </Button>
              <pre className="bg-muted p-2 rounded text-sm overflow-auto max-h-60">
                {results[route] || 'Not triggered yet'}
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
