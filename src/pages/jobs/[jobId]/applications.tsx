'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
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
    <main className="px-4 py-10 flex justify-center">
      <div className="w-full sm:w-[80vw] lg:w-[50vw] space-y-8">
        <h1 className="text-2xl font-bold text-center">Applicants</h1>

        {loading ? (
          <p className="text-muted-foreground text-center">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-muted-foreground text-center">No applications yet.</p>
        ) : (
          <div className="space-y-6">
            {applications.map((app: any) => (
              <Card key={app._id} className="shadow-md">
                <CardHeader>
                  <CardTitle>{app.userId?.name}</CardTitle>
                  <CardDescription>Status: {app.status}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div>
                    <p className="font-semibold">Cover Letter:</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {app.coverLetter || 'No cover letter submitted.'}
                    </p>
                  </div>
                  {app.userId?.resumeUrl && (
                    <Button
                    className="bg-white text-black border border-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => window.open(app.userId.resumeUrl, '_blank')}
                  >
                      View Resume
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
