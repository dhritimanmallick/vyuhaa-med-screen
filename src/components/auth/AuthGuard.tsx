
import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

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
        <div className="flex flex-col space-y-4">
          {showSignUp ? (
            <SignUpForm onSwitchToLogin={() => setShowSignUp(false)} />
          ) : (
            <LoginForm />
          )}
          {!showSignUp && (
            <div className="text-center">
              <button
                onClick={() => setShowSignUp(true)}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Don't have an account? Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
