import { withAuth } from '@/lib/withAuth';
import { useAuth } from '@/context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Welcome {user?.name || user?.email}</h1>
      <p>Your role: {user?.role}</p>
    </div>
  );
}

export default withAuth(DashboardPage);
