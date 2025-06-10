
import AuthGuard from "../components/auth/AuthGuard";
import Dashboard from "../components/dashboard/Dashboard";
import { useAuth } from "../hooks/useAuth";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Dashboard user={user} onLogout={signOut} />
      </div>
    </AuthGuard>
  );
};

export default Index;
