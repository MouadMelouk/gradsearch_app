'use client';

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

export default function ApplyJobPage() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const { jobId } = router.query;

  const [job, setJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [cvModalOpen, setCvModalOpen] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
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
  }, [jobId]);

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
    <main className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Apply for: {job.title}</CardTitle>
          <CardDescription>{job.company || job.location}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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

            <div className="flex flex-col gap-2">
              <Label>Resume</Label>
              <div className="flex gap-4">
                {user.resumeUrl ? (
                  <Button variant="outline" onClick={() => window.open(user.resumeUrl!, '_blank')}>
                    View Current
                  </Button>
                ) : (
                  <p className="text-sm text-red-600">You haven’t uploaded a resume yet.</p>
                )}
                <Button type="button" onClick={() => setCvModalOpen(true)}>
                  {user.resumeUrl ? 'Replace' : 'Upload'}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </CardFooter>
        </form>
      </Card>

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
