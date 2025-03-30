'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadCvModal({ open, onClose }: Props) {
  const { token, refreshUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !token) {
      toast.error('No file selected or user not authenticated');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files allowed');
      return;
    }

    try {
      setIsUploading(true);

      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileType: file.type }),
      });

      const { signedUrl, publicUrl } = await presignRes.json();
      if (!presignRes.ok) throw new Error('Presign failed');

      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');

      const saveRes = await fetch('/api/upload/cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeUrl: publicUrl }),
      });
      if (!saveRes.ok) throw new Error('Failed to save resume');

      await refreshUser(); // ✅ Update context with latest resumeUrl
      toast.success('Resume uploaded successfully');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Resume (PDF)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label htmlFor="resume">Select PDF File</Label>
          <Input
            id="resume"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button onClick={handleUpload} disabled={isUploading} className="w-full">
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
