
import LoginForm from "../components/auth/LoginForm";
import Dashboard from "../components/dashboard/Dashboard";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard user={user} onLogout={signOut} />
    </div>
  );
};

export default Index;
