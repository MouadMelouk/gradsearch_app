import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm px-4 py-3">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            GradSearch
          </Link>
          <div className="space-x-4">
            <Link href="/jobs">Jobs</Link>
            {user?.role === 'employer' && (
              <>
                <Link href="/job/post/create">Post Job</Link>
                <Link href="/dashboard">Manage Jobs</Link>
              </>
            )}
            {user?.role === 'student' && (
              <>
                <Link href="/dashboard">My Applications</Link>
                <Link href="/upload/cv">Upload CV</Link>
              </>
            )}
            {!user && (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>
              </>
            )}
            {user && <button onClick={logout}>Logout</button>}
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto p-4">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-sm py-4 border-t mt-8">
        <div className="space-x-4">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="text-gray-500 mt-2">© 2025 GradSearch</p>
      </footer>
    </div>
  );
}
