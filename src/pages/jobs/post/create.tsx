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
    <main className="flex items-center justify-center py-16 px-4">
      <div className="w-[90vw] sm:w-[60vw] lg:w-[50vw] max-w-3xl">
        <Card className="shadow-md">
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
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <div>
                <Label>Company *</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
              </div>
              <div>
                <Label>Location</Label>
                <Input 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="e.g. Abu Dhabi, UAE"
                />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  placeholder="e.g. remote, on-site, hybrid, AI, marketing, internship"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Posting...' : 'Post Job'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
export const getServerSideProps = async () => ({ props: {} });
