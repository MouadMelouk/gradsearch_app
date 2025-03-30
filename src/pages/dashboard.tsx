'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import UploadCvModal from '@/components/UploadCvModal';
import { withRolePageGuard } from '@/lib/withRolePageGuard';

type Role = 'student' | 'employer';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  resumeUrl?: string;
}

export default withRolePageGuard(Dashboard, ['student', 'employer']);

function Dashboard() {
  const { user, token } = useAuth() as { user: AuthUser | null; token: string | null };
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cvModalOpen, setCvModalOpen] = useState(false);

  useEffect(() => {
    if (!user || !token) return;

    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/${user.role}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const data = await res.json();
        setApplications(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, token]);

  if (!user) return null;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {user.role === 'student' ? 'Student Dashboard' : 'Employer Dashboard'}
      </h1>

      {loading && <p className="text-muted-foreground">Loading...</p>}

      {user.role === 'student' && (
        <section className="space-y-4">
          {/* Applications List */}
          {applications.length > 0 ? (
            applications.map((app: any) => (
              <Card key={app._id}>
                <CardHeader>
                  <CardTitle>{app.jobTitle}</CardTitle>
                  <CardDescription>Status: {app.status}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/applications/${app._id}`)}
                  >
                    View Application
                  </Button>
                </CardContent>
              </Card>

            ))
          ) : (
            <p className="text-sm text-muted-foreground">You haven’t applied to any jobs yet.</p>
          )}

          {/* Resume Section */}
          <section className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
                <CardDescription>
                  You need an uploaded resume to apply to jobs.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {user.resumeUrl ? (
                  <Button variant="outline" onClick={() => window.open(user.resumeUrl, '_blank')}>
                    View Uploaded Resume
                  </Button>
                ) : (
                  <p className="text-sm text-red-600">You haven’t uploaded a resume yet.</p>
                )}
                <Button onClick={() => setCvModalOpen(true)}>
                  {user.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Resume Upload Modal */}
          <UploadCvModal open={cvModalOpen} onClose={() => setCvModalOpen(false)} />
        </section>
      )}

      {user.role === 'employer' && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Posted Jobs</h2>
            <Button onClick={() => router.push('/jobs/post/create')}>Post New Job</Button>
          </div>

          {applications.length > 0 ? (
            applications.map((job: any) => (
              <Card key={job._id}>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>
                    {job.company} – {job.location || 'Remote'} • Posted{' '}
                    {new Date(job.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm flex justify-between items-center">
                  <p>{job.applicantCount} applicant{job.applicantCount === 1 ? '' : 's'}</p>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => router.push(`/jobs/${job._id}/applications`)}>
                      View Applications
                    </Button>
                    <Button variant="secondary" disabled>Edit</Button>
                    <Button variant="destructive" disabled>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">You haven’t posted any jobs yet.</p>
          )}
        </section>
      )}

    </main>
  );
}
