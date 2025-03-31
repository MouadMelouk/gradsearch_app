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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import clsx from 'clsx'; // for conditional classNames

interface Props {
  applicationId: string;
  open: boolean;
  onClose: () => void;
}

type EditStep = 'idle' | 'editing' | 'confirm';
type RetractStep = 'idle' | 'confirm';

export default function ViewApplicationModal({ applicationId, open, onClose }: Props) {
  const { token } = useAuth();
  const [appData, setAppData] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [newResumeUrl, setNewResumeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Manage the user’s “edit” flow
  const [editStep, setEditStep] = useState<EditStep>('idle');

  // Keep the retract logic the same as before
  const [retractStep, setRetractStep] = useState<RetractStep>('idle');

  // Track an uploaded File (for the new resume, if any)
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Store original values so that we can revert if user closes the modal without confirming
  const [originalCoverLetter, setOriginalCoverLetter] = useState('');
  const [originalResumeUrl, setOriginalResumeUrl] = useState('');

  const { application, job } = appData || {};

  // Fetch application data when modal opens
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

        setCoverLetter(data.application.coverLetter);
        setNewResumeUrl(data.application.resumeUrl);

        setOriginalCoverLetter(data.application.coverLetter);
        setOriginalResumeUrl(data.application.resumeUrl);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load application');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [open, applicationId, token, onClose]);

  // Whenever the modal opens, reset edit/retract states and revert to original data
  useEffect(() => {
    if (open) {
      setEditStep('idle');
      setRetractStep('idle');
      setCoverLetter(originalCoverLetter);
      setNewResumeUrl(originalResumeUrl);
      setResumeFile(null);
    }
  }, [open, originalCoverLetter, originalResumeUrl]);

  // Handle the main edit/update flow
  const handleUpdate = async () => {
    if (editStep === 'idle') {
      // Move from idle to editing
      setEditStep('editing');
      return;
    }

    if (editStep === 'editing') {
      // Move from editing to confirm
      setEditStep('confirm');
      return;
    }

    if (editStep === 'confirm') {
      // Finalize: upload if needed, then patch
      try {
        let resumeUrlToSubmit = newResumeUrl;

        // If a new file was selected, upload it to S3
        if (resumeFile) {
          const presignRes = await fetch('/api/upload/presign', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fileType: resumeFile.type }),
          });

          if (!presignRes.ok) throw new Error('Failed to get presigned URL');
          const { signedUrl, publicUrl } = await presignRes.json();

          const uploadRes = await fetch(signedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': resumeFile.type,
            },
            body: resumeFile,
          });

          if (!uploadRes.ok) throw new Error('Resume upload failed');
          resumeUrlToSubmit = publicUrl;
        }

        // Now update the application
        const res = await fetch(`/api/applications/${applicationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coverLetter,
            resumeUrl: resumeUrlToSubmit,
          }),
        });

        if (!res.ok) throw new Error('Failed to update application');
        toast.success('Application updated');

        // Reset steps and close
        setEditStep('idle');
        onClose();
      } catch (err: any) {
        toast.error(err.message || 'Could not update');
      }
    }
  };

  // Retract flow (unchanged)
  const handleRetract = async () => {
    if (retractStep === 'idle') {
      setRetractStep('confirm');
      return;
    }

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to retract application');
      toast.success('Application retracted');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Could not retract');
    }
  };

  // Helper booleans for UI
  const isIdle = editStep === 'idle';
  const isEditing = editStep === 'editing' || editStep === 'confirm';

  // Choose the label and style for the main button
  let mainButtonLabel = 'Edit';
  let mainButtonClass = 'bg-white text-black border border-black hover:bg-black hover:text-white';
  if (editStep === 'editing') {
    mainButtonLabel = 'Submit';
  } else if (editStep === 'confirm') {
    mainButtonLabel = 'Confirm';
    // Make it blue for the confirm state
    mainButtonClass = 'bg-blue-500 text-white hover:bg-blue-600 border-blue-500';
  }

  // For the Textarea, switch the border to white in read-only mode
  const textareaClass = clsx(
    'w-full min-h-[120px] text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black',
    isEditing ? 'border border-black' : 'border border-white'
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {job?.title || 'Job Title'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {job?.company} &mdash; {job?.location || 'Remote'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground px-2 py-4">Loading...</p>
        ) : (
          <div className="text-sm space-y-6 pt-2 px-1 pb-2">
            <section>
              <h3 className="text-sm font-medium text-muted-foreground">Job Description</h3>
              <p className="whitespace-pre-wrap">{job.description}</p>
            </section>

            <section className="grid grid-cols-2 gap-y-2">
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Date Applied</span>
                <p>{new Date(application.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Status</span>
                <p className="capitalize">{application.status}</p>
              </div>
            </section>

            <section className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Cover Letter</h3>
              <Textarea
                className={textareaClass}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                readOnly={!isEditing}
              />
            </section>

            <section className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Resume</h3>
                <div className="flex gap-2 flex-wrap items-center">
                    <Button
                    size="sm"
                    className="bg-white text-black border border-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => window.open(newResumeUrl, '_blank')}
                    >
                    View Resume
                    </Button>
                    {isEditing && (
                    <>
                        <Button asChild size="sm">
                        <label htmlFor="resumeFileInput" className="cursor-pointer">
                            Choose File
                        </label>
                        </Button>
                        <input
                        id="resumeFileInput"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                            setResumeFile(file);
                            toast.success('New resume selected. Click Confirm to upload.');
                            }
                        }}
                        className="hidden"
                        />
                        <span className="text-sm text-muted-foreground">
                        {resumeFile ? resumeFile.name : 'No file chosen'}
                        </span>
                    </>
                    )}
                </div>
                </section>

            <div className="flex justify-end gap-2 pt-4 border-t pt-3">
              {/* The edit/submit/confirm button */}
              <Button
                size="sm"
                className={mainButtonClass}
                onClick={handleUpdate}
              >
                {mainButtonLabel}
              </Button>

              {/* The retract flow is unchanged */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRetract}
              >
                {retractStep === 'idle' ? 'Retract' : 'Confirm'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
