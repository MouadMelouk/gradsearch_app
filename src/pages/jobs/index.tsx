'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Job = {
  _id: string;
  title: string;
  description: string;
  location: string;
  company?: string;
  tags?: string[];
};

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data);
      } catch (err: any) {
        toast.error(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Available Jobs</h1>

      {loading && <p className="text-muted-foreground">Loading jobs...</p>}

      {!loading && jobs.length === 0 && (
        <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job._id} className="flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.company || job.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="line-clamp-3">{job.description}</p>
                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
            <CardContent className="pt-4">
              <Button
                className="w-full"
                onClick={() => router.push(`/jobs/apply/${job._id}`)}
              >
                Apply
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
