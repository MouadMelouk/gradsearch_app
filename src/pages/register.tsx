import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      login(data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-6 space-y-4">
      <h1 className="text-xl font-bold">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          required
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          type="password"
          required
        />
        <select
          name="role"
          className="w-full p-2 border rounded"
          value={form.role}
          onChange={handleChange}
        >
          <option value="student">Student</option>
          <option value="employer">Employer</option>
        </select>
        <Button type="submit" className="w-full">Register</Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </main>
  );
}
