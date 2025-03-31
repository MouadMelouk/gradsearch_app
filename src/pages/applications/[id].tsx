'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface ViewApplicationModalProps {
  applicationId: string;
  open: boolean;
  onClose: () => void;
}

export default function ViewApplicationModal({ applicationId, open, onClose }: ViewApplicationModalProps) {
  const { token } = useAuth();
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !applicationId) return;

    const fetchApp = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/applications/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAppData(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load application');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [open, applicationId]);

  const { application, job } = appData || {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{job?.title || 'Application'}</DialogTitle>
          <DialogDescription>
            {job?.company} – {job?.location}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground px-2">Loading...</p>
        ) : (
          <CardContent className="space-y-4 text-sm px-2">
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
              <Button
                variant="outline"
                onClick={() => window.open(application.resumeUrl, '_blank')}
              >
                View Resume
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" disabled>Edit</Button>
              <Button variant="destructive" disabled>Retract</Button>
            </div>
          </CardContent>
        )}
      </DialogContent>
    </Dialog>
  );
}
export const getServerSideProps = async () => ({ props: {} });
