
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      console.log('Login attempt for:', email);
      await signIn(email, password);
      console.log('Login successful, redirecting...');
      // Force page reload after successful login
      window.location.href = '/';
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Test user accounts with secure password
  const testAccounts = [
    { email: "admin@vyuhaa.com", label: "Admin", role: "admin" },
    { email: "pathologist@vyuhaa.com", label: "Pathologist", role: "pathologist" },
    { email: "accession@vyuhaa.com", label: "Accession Team", role: "accession" },
    { email: "technician@vyuhaa.com", label: "Technician", role: "technician" },
    { email: "customer@vyuhaa.com", label: "Customer", role: "customer" }
  ];

  const quickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword("SecureVyuhaa2024!");
    setError("");
    setIsLoading(true);
    
    try {
      console.log('Quick login attempt for:', userEmail);
      await signIn(userEmail, "SecureVyuhaa2024!");
      console.log('Quick login successful, redirecting...');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Quick login error:', error);
      setError(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-blue-900">Vyuhaa Med</CardTitle>
        <CardDescription className="text-teal-600">
          Cervical Cancer Screening Platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 text-center">Quick Login (Testing):</p>
          <div className="space-y-2">
            {testAccounts.map((account) => (
              <Button 
                key={account.email}
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => quickLogin(account.email)}
                disabled={isLoading}
              >
                {account.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            All test accounts use password: SecureVyuhaa2024!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
