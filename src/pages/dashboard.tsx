'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import UploadCvModal from '@/components/UploadCvModal';
import { withRolePageGuard } from '@/lib/withRolePageGuard';
import ViewApplicationModal from '@/components/ViewApplicationModal';
import EditJobModal from '@/components/EditJobModal'; // <-- import our new component

type Role = 'student' | 'employer';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  resumeUrl?: string;
}

function Dashboard() {
  const { user, token } = useAuth() as { user: AuthUser | null; token: string | null };
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For student CV
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // For employer edit modal
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // For delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Reusable fetch function
  const fetchApplications = useCallback(async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      // Student fetches /api/dashboard/student
      // Employer fetches /api/dashboard/employer
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
  }, [user, token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  if (!user) return null;

  // Handler to delete a job
  const handleDeleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete job');
      }
      toast.success('Job deleted successfully');
      setDeleteConfirmId(null);
      fetchApplications(); // Refresh the table
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Shared function after we finish editing
  const onJobUpdated = () => {
    fetchApplications();
  };

  return (
    <main className="w-full flex justify-center">
      <div className="w-full px-4 py-10 space-y-10 mx-auto sm:w-[80vw] lg:w-[70vw]">

        <h1 className="text-2xl font-bold">
          {user.role === 'student' ? 'Student Dashboard' : 'Employer Dashboard'}
        </h1>

        {loading && <p className="text-muted-foreground">Loading...</p>}

        {/* ------------------------- STUDENT VIEW ------------------------- */}
        {user.role === 'student' && (
          <>
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Your Applications</h2>
              {applications.length > 0 ? (
                <div className="overflow-hidden rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white text-left font-semibold text-black border-b">
                        <th className="px-4 py-2">Job Title</th>
                        <th className="px-4 py-2">Company</th>
                        <th className="px-4 py-2">Location</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app: any) => (
                        <tr
                          key={app._id}
                          className="bg-faintgray hover:bg-muted/30 border-t"
                        >
                          <td className="px-4 py-2">{app.jobTitle}</td>
                          <td className="px-4 py-2">{app.company}</td>
                          <td className="px-4 py-2">
                            {app.location || '—'}
                          </td>
                          <td className="px-4 py-2">{app.status}</td>
                          <td className="px-4 py-2">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedAppId(app._id)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You haven’t applied to any jobs yet.
                </p>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">Resume</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Resume</CardTitle>
                  <CardDescription>
                    You need an uploaded resume to apply to jobs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {user.resumeUrl ? (
                    <Button
                      variant="outline"
                      onClick={() => window.open(user.resumeUrl, '_blank')}
                    >
                      View Uploaded Resume
                    </Button>
                  ) : (
                    <p className="text-sm text-red-600">
                      You haven’t uploaded a resume yet.
                    </p>
                  )}
                  <Button onClick={() => setCvModalOpen(true)}>
                    {user.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                  </Button>
                </CardContent>
              </Card>

              <UploadCvModal
                open={cvModalOpen}
                onClose={() => setCvModalOpen(false)}
              />
              {selectedAppId && (
                <ViewApplicationModal
                  applicationId={selectedAppId}
                  open={!!selectedAppId}
                  onClose={() => {
                    setSelectedAppId(null);
                    // Refresh apps after retract or changes
                    fetchApplications();
                  }}
                />
              )}
            </section>
          </>
        )}

        {/* ------------------------- EMPLOYER VIEW ------------------------- */}
        {user.role === 'employer' && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Your Posted Jobs</h2>
              <Button onClick={() => router.push('/jobs/post/create')}>
                Post New Job
              </Button>
            </div>

            {applications.length > 0 ? (
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white text-left font-semibold text-black border-b">
                      <th className="px-4 py-2">Title</th>
                      <th className="px-4 py-2">Company</th>
                      <th className="px-4 py-2">Location</th>
                      <th className="px-4 py-2">Applicants</th>
                      <th className="px-4 py-2 text-center w-[250px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((job: any) => (
                      <tr
                        key={job._id}
                        className="bg-faintgray hover:bg-muted/30 border-t"
                      >
                        <td className="px-4 py-2">{job.title}</td>
                        <td className="px-4 py-2">{job.company}</td>
                        <td className="px-4 py-2">
                          {job.location || '—'}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {job.applicantCount}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
                            {/* View Applicants Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/jobs/${job._id}/applications`)
                              }
                            >
                              View Applicants
                            </Button>

                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditingJobId(job._id)}
                            >
                              Edit
                            </Button>

                            {/* Delete Button w/ double confirm */}
                            {deleteConfirmId === job._id ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteJob(job._id)}
                              >
                                Confirm
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteConfirmId(job._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You haven’t posted any jobs yet.
              </p>
            )}
          </section>
        )}
      </div>

      {/* The Edit Job Modal */}
      <EditJobModal
        open={!!editingJobId}
        jobId={editingJobId}
        onClose={() => setEditingJobId(null)}
        onJobUpdated={onJobUpdated}
      />
    </main>
  );
}

export default withRolePageGuard(Dashboard, ['student', 'employer']);
