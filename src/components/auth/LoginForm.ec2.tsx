/**
 * Login Form for EC2 self-hosted backend.
 * Uses JWT authentication via /api/auth/login.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/ec2/useAuth";
import cerviaiLogo from "@/assets/cerviai-logo.jpeg";

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
      await signIn(email, password);
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const testAccounts = [
    { email: "admin@vyuhaa.com", password: "Password@1", label: "Admin" },
    { email: "pathologist@vyuhaa.com", password: "Password@1", label: "Pathologist" },
    { email: "accession@vyuhaa.com", password: "Password@1", label: "Accession Team" },
    { email: "technician@vyuhaa.com", password: "Password@1", label: "Technician" },
    { email: "customer@vyuhaa.com", password: "Password@1", label: "Customer" },
  ];

  const quickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError("");
    setIsLoading(true);

    try {
      await signIn(userEmail, userPassword);
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center space-y-3">
        <div className="flex justify-center">
          <img src={cerviaiLogo} alt="CerviAI Logo" className="h-28 object-contain" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-primary">
            Vyuhaa Med Data
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Digital Pathology Information Management System
          </CardDescription>
        </div>
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

          <Button type="submit" className="w-full" disabled={isLoading}>
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

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3 text-center">
            Quick Login (Testing):
          </p>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
