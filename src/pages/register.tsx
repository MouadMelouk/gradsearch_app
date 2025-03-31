'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'employer' | ''>('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      if (!name || !email || !password || !role) {
        throw new Error('All fields are required.');
      }

      const check = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const checkData = await check.json();
      if (checkData.exists) throw new Error('Email is already in use.');

      const register = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const registerData = await register.json();
      if (!register.ok) throw new Error(registerData.error || 'Registration failed');

      localStorage.setItem('token', registerData.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex items-center justify-center py-20 px-4">
      <div className="w-[80vw] sm:w-[50vw] max-w-md">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create an account to get started</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as 'student' | 'employer')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'student' && (
                <p className="text-sm text-muted-foreground">
                  You’ll need to upload a resume before applying to jobs.
                </p>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>

            <CardFooter>
              <Button type="submit" disabled={isProcessing} className="w-full">
                {isProcessing ? 'Registering...' : 'Create Account'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
