/**
 * Index page for EC2 self-hosted backend.
 * Uses EC2 AuthGuard and Dashboard.
 */

import AuthGuard from "../components/auth/AuthGuard.ec2";
import Dashboard from "../components/dashboard/Dashboard";
import { useAuth } from "@/lib/ec2/useAuth";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Dashboard user={user} onLogout={signOut} />
      </div>
    </AuthGuard>
  );
};

export default Index;
