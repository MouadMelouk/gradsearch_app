'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ViewApplicationPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { id } = useParams(); // application ID
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAppData(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load application');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id, token]);

  if (loading) return <main className="p-6">Loading...</main>;
  if (!appData) return null;

  const { application, job } = appData;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>{job.company} – {job.location}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <strong>Status:</strong> {application.status}
          </div>

          {application.coverLetter && (
            <div>
              <strong>Cover Letter:</strong>
              <p className="whitespace-pre-wrap mt-1">{application.coverLetter}</p>
            </div>
          )}

          <div>
            <strong>Resume:</strong>
            <br />
            <Button variant="outline" onClick={() => window.open(application.resumeUrl, '_blank')}>
              View Resume
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
