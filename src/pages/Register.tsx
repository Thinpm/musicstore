
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister, useCurrentUser } from "@/hooks/useUser";
import { Loader2 } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailConfirmRequired, setEmailConfirmRequired] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: register, isPending } = useRegister();
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();

  // If already logged in, redirect to dashboard
  if (!isLoadingUser && user) {
    return <Navigate to="/" />;
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreedToTerms) {
      toast({
        title: "Error",
        description: "You must agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }
    
    register({
      name,
      email,
      username: email.split('@')[0], // Using email prefix as username
      password
    }, {
      onError: (error) => {
        if (error instanceof Error && 
            error.message.includes('check your email')) {
          setEmailConfirmRequired(true);
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Sign up for SoundStreamline to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {emailConfirmRequired ? (
            <div className="p-4 mb-4 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-md">
              <h3 className="font-semibold mb-1">Check your email</h3>
              <p className="text-sm">
                We've sent a confirmation link to your email. Please check your inbox and confirm your account before logging in.
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-amber-800 dark:text-amber-200 mt-2"
                onClick={() => navigate('/login')}
              >
                Go to login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms} 
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  disabled={isPending}
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <a href="#" className="text-accent hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-accent hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}
          
          {!emailConfirmRequired && (
            <>
              <div className="flex items-center my-4">
                <Separator className="flex-1" />
                <span className="px-2 text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>
              
              <div className="grid gap-2">
                <Button variant="outline" className="w-full" disabled={isPending}>
                  Sign up with Google
                </Button>
                <Button variant="outline" className="w-full" disabled={isPending}>
                  Sign up with GitHub
                </Button>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
