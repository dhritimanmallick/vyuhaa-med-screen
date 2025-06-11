
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
      window.location.href = '/';
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Updated test accounts with new simplified passwords
  const testAccounts = [
    { email: "admin@vyuhaa.com", password: "Password@1", label: "Admin", role: "admin" },
    { email: "pathologist@vyuhaa.com", password: "Password@1", label: "Pathologist", role: "pathologist" },
    { email: "accession@vyuhaa.com", password: "Password@1", label: "Accession Team", role: "accession" },
    { email: "technician@vyuhaa.com", password: "Password@1", label: "Technician", role: "technician" },
    { email: "customer@vyuhaa.com", password: "Password@1", label: "Customer", role: "customer" }
  ];

  const quickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError("");
    setIsLoading(true);
    
    try {
      console.log('Quick login attempt for:', userEmail);
      await signIn(userEmail, userPassword);
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
                onClick={() => quickLogin(account.email, account.password)}
                disabled={isLoading}
              >
                {account.label} (Password@1)
              </Button>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500 text-center">
            All test accounts use password: Password@1
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
