'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { withRolePageGuard } from '@/lib/withRolePageGuard';

export default withRolePageGuard(ViewApplicationsPage, ['employer']);

function ViewApplicationsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { jobId } = useParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}/applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setApplications(data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId, token]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Applicants</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-muted-foreground">No applications yet.</p>
      ) : (
        applications.map((app: any) => (
          <Card key={app._id}>
            <CardHeader>
              <CardTitle>{app.userId?.name}</CardTitle>
              <CardDescription>Status: {app.status}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {app.userId?.resumeUrl && (
                <Button variant="outline" onClick={() => window.open(app.userId.resumeUrl, '_blank')}>
                  View Resume
                </Button>
              )}
              <div>
                <p className="font-semibold">Cover Letter:</p>
                <p className="whitespace-pre-wrap">{app.coverLetter || 'No cover letter submitted.'}</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </main>
  );
}
