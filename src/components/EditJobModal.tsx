'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; 
// ^ Replace with your own Modal or Dialog component as needed
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface EditJobModalProps {
  open: boolean;
  jobId: string | null;
  onClose: () => void;
  onJobUpdated: () => void; // parent can refresh job list
}

export default function EditJobModal({
  open,
  jobId,
  onClose,
  onJobUpdated,
}: EditJobModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');

  // Load the job details whenever jobId changes (and open is true)
  useEffect(() => {
    if (!jobId || !open) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch job details');
        }
        const job = await res.json();
        setTitle(job.title || '');
        setDescription(job.description || '');
        setCompany(job.company || '');
        setLocation(job.location || '');
        setTags(Array.isArray(job.tags) ? job.tags.join(', ') : '');
      } catch (err: any) {
        toast.error(err.message);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, open, token, onClose]);

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;

    if (!title || !description || !company) {
      toast.error('Please fill in title, description, and company.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          company,
          location,
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update job');
      }
      toast.success('Job updated successfully');
      onClose();      // close modal
      onJobUpdated(); // refresh parent data
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateJob} className="space-y-4">
          <div>
            <Label>Job Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label>Company *</Label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input
              placeholder="e.g. remote, frontend, internship"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
