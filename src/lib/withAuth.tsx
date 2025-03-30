import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import type { ComponentType, JSX } from 'react';

// constrained P to JSX.IntrinsicAttributes so TS is happy and stops complaining
export function withAuth<P extends JSX.IntrinsicAttributes>(
  Component: ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!user) router.push('/login');
    }, [user]);

    if (!user) return null;

    return <Component {...props} />;
  };
}
