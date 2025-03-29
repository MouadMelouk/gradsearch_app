import { useAuth } from '@/context/AuthContext';

const HomePage = () => {
  const { user, login, logout } = useAuth();

  return (
    <div className="p-6">
      {user ? (
        <div>
          Logged in as {user.email} ({user.role})
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
};

export default HomePage;
