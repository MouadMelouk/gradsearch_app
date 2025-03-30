import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-background shadow-sm px-4 py-3">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            GradSearch
          </Link>
          <div className="space-x-4 text-sm">
            {user?.role === 'employer' && (
              <>
                <Link href="/job/post/create" className="hover:underline">Post Job</Link>
                <Link href="/dashboard" className="hover:underline">Manage Jobs</Link>
              </>
            )}
            {user?.role === 'student' && (
              <>
                <Link href="/jobs" className="hover:underline">Jobs</Link>
                <Link href="/dashboard" className="hover:underline">My Applications</Link>
              </>
            )}
            {!user && (
              <>
                <Link href="/login" className="hover:underline">Login</Link>
                <Link href="/register" className="hover:underline">Register</Link>
              </>
            )}
            {user && (
              <button
                onClick={logout}
                className="text-sm hover:underline"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto p-6">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-background text-foreground text-sm py-6 mt-8">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <div className="space-x-4">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
          <p className="text-muted-foreground">© 2025 GradSearch</p>
        </div>
      </footer>
    </div>
  );
}
