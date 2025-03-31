'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-background shadow-sm px-4 py-3">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Always visible brand link */}
          <Link href="/" className="font-bold text-lg">
            GradSearch Demo
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-4 text-sm">
            {user?.role === 'employer' && (
              <>
                <Link href="/jobs/post/create" className="hover:underline">Post Job</Link>
                <Link href="/dashboard" className="hover:underline">Manage Jobs</Link>
              </>
            )}
            {user?.role === 'student' && (
              <>
                <Link href="/jobs" className="hover:underline">Jobs</Link>
                <Link href="/dashboard" className="hover:underline">My Dashboard</Link>
              </>
            )}
            {!user && (
              <>
                <Link href="/jobs" className="hover:underline">Jobs</Link>
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

          {/* Mobile Burger */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-sm p-2 border rounded-md hover:bg-accent"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>

            {menuOpen && (
              <div className="absolute right-4 top-16 w-48 bg-background shadow-md border rounded-md p-3 space-y-2 z-50 text-sm">
                {user?.role === 'employer' && (
                  <>
                    <Link href="/jobs/post/create" className="block hover:underline" onClick={closeMenu}>Post Job</Link>
                    <Link href="/dashboard" className="block hover:underline" onClick={closeMenu}>Manage Jobs</Link>
                  </>
                )}
                {user?.role === 'student' && (
                  <>
                    <Link href="/jobs" className="block hover:underline" onClick={closeMenu}>Jobs</Link>
                    <Link href="/dashboard" className="block hover:underline" onClick={closeMenu}>My Dashboard</Link>
                  </>
                )}
                {!user && (
                  <>
                    <Link href="/jobs" className="block hover:underline" onClick={closeMenu}>Jobs</Link>
                    <Link href="/login" className="block hover:underline" onClick={closeMenu}>Login</Link>
                    <Link href="/register" className="block hover:underline" onClick={closeMenu}>Register</Link>
                  </>
                )}
                {user && (
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="block w-full text-left hover:underline"
                  >
                    Logout
                  </button>
                )}
              </div>
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
