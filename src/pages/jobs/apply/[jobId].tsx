'use client';

import { withRolePageGuard } from '@/lib/withRolePageGuard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import UploadCvModal from '@/components/UploadCvModal';

type Job = {
  _id: string;
  title: string;
  description: string;
  company?: string;
  location: string;
  tags?: string[];
};

export default withRolePageGuard(ApplyJobPage, ['student']);

function ApplyJobPage() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const { jobId } = router.query;

  const [job, setJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [cvModalOpen, setCvModalOpen] = useState(false);

  // Fetch the job details if we have both a jobId and a token
  useEffect(() => {
    if (!jobId || !token) {
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Could not load job');
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        toast.error(err.message || 'Error loading job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, token]);

  // Submit application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token || !jobId) return;

    if (!user.resumeUrl) {
      toast.error('You must upload a resume before applying.');
      return;
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          coverLetter,
          resumeUrl: user.resumeUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply');

      toast.success('Application submitted!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  if (!user) return null;

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading job info...</p>;
  }

  if (!job) {
    return <p className="p-6 text-destructive">Job not found</p>;
  }

  return (
    <main className="flex items-center justify-center py-10 px-4">
    <div className="w-[90vw] sm:w-[50vw] max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>
            {job.company} &mdash; {job.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Job Details */}
          <div>
            <Label>Job Description</Label>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {job.description}
            </p>
          </div>
          {job.tags && job.tags.length > 0 && (
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write a short cover letter..."
                rows={6}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label>Resume</Label>
                <div className="mt-1">
                  {user.resumeUrl ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.open(user.resumeUrl!, '_blank')}
                    >
                      View Current
                    </Button>
                  ) : (
                    <p className="text-sm text-red-600">
                      You haven’t uploaded a resume yet.
                    </p>
                  )}
                </div>
              </div>
              <div className="sm:pt-5 flex items-start sm:items-end">
                <Button type="button" onClick={() => setCvModalOpen(true)}>
                  {user.resumeUrl ? 'Replace' : 'Upload'}
                </Button>
              </div>
            </div>
            <CardFooter>
              <Button type="submit" className="w-full">
                Submit Application
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      </div>
      {/* Upload CV modal */}
      <UploadCvModal
        open={cvModalOpen}
        onClose={async () => {
          setCvModalOpen(false);
          await refreshUser();
        }}
      />
    
    </main>
  );
}
export const getServerSideProps = async () => ({ props: {} });
