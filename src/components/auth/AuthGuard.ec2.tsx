/**
 * Auth Guard for EC2 self-hosted backend.
 * Uses EC2 JWT authentication.
 */

import { ReactNode } from "react";
import { useAuth } from "@/lib/ec2/useAuth";
import LoginForm from "./LoginForm.ec2";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoginForm />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
