import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui/loader';

export function withRolePageGuard<T extends object>(
  Component: React.ComponentType<T>,
  allowedRoles: ('student' | 'employer')[]
) {
  return function GuardedPage(props: T) {
    const { user, token, isReady } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');

    useEffect(() => {
      if (!isReady) return;

      // Case 1: not logged in at all
      if (!user && !token) {
        setStatus('denied');
        return;
      }

      // Case 2: user exists and role is allowed
      if (user && allowedRoles.includes(user.role)) {
        setStatus('allowed');
        return;
      }

      // Case 3: user exists but wrong role
      if (user && !allowedRoles.includes(user.role)) {
        setStatus('denied');
        return;
      }

      // Otherwise still waiting for user to resolve
      setStatus('loading');
    }, [user, token, isReady]);

    if (!isReady || status === 'loading') {
      return <Loader />;
    }

    if (status === 'denied') {
      return (
        <div className="p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You do not have access to this page.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
