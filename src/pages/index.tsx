'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const { user, logout } = useAuth();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (hasShownToast.current) return;

    const timer = setTimeout(() => {
      if (user) {
        toast('You are logged in', {
          description: `${user.email} (${user.role})`,
        });
      } else {
        toast.error('You are not logged in');
      }
    }, 800);

    hasShownToast.current = true;
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <main className="w-[90vw] sm:w-[50vw] max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-2xl font-bold text-center">Welcome to the Limited Demo Platform</h1>

      <div className="space-y-6">
  <div className="grid gap-6 sm:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Grad looking for a job?</CardTitle>
        <CardDescription>Explore open opportunities tailored for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/jobs">
          <Button className="w-full">Browse Jobs</Button>
        </Link>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Employer wanting to recruit?</CardTitle>
        <CardDescription>Post new jobs and discover top talent.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/jobs/post/create">
          <Button className="w-full">Create Job Posting</Button>
        </Link>
      </CardContent>
    </Card>
  </div>
 
  <div className="mx-auto w-full sm:w-1/2">
    <Card>
      <CardHeader>
        <CardTitle>Not sure what fits?</CardTitle>
        <CardDescription>Let AI analyze your resume and match you with jobs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/jobmatching">
          <Button className="w-full">Try AI Job Matching</Button>
        </Link>
      </CardContent>
    </Card>
  </div>
</div>


      {user && (
        <div className="text-center text-sm text-muted-foreground pt-4">
          Logged in as <span className="font-medium">{user.email}</span> (
          <span className="capitalize">{user.role}</span>) —{' '}
          <button onClick={logout} className="underline hover:text-black">
            Logout
          </button>
        </div>
      )}
    </main>
  );
};

export default HomePage;
export const getServerSideProps = async () => ({ props: {} });
