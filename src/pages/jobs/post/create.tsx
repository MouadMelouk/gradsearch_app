'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { withRolePageGuard } from '@/lib/withRolePageGuard';

export default withRolePageGuard(PostJobPage, ['employer']);

function PostJobPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !company) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          company,
          location,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Job creation failed');

      toast.success('Job posted successfully');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'employer') return null;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label>Job Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div>
              <Label>Company *</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input
                placeholder="e.g. remote, frontend, internship"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </CardContent>
          <div className="p-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
