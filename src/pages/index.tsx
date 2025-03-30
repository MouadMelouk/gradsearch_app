'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner'; // Styled by your custom <Toaster />

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
    });

    hasShownToast.current = true;
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <div className="p-6">
      {user ? (
        <div>
          Logged in as {user.email} ({user.role}){' '}
          <button onClick={logout} className="ml-2 underline">
            Logout
          </button>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
};

export default HomePage;
