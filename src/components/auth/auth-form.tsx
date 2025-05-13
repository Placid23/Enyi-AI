'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { Loader2, ShieldCheck } from 'lucide-react'; // Changed icon

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === 'signup' && password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);

    if (Math.random() > 0.1) { // Simulate success
      toast({
        title: mode === 'signin' ? 'Sign In Successful' : 'Sign Up Successful',
        description: mode === 'signin' ? 'Welcome back!' : 'Your account has been created.',
      });
      router.push('/'); // Redirect to main app page
    } else { // Simulate error
        toast({
            title: 'Authentication Failed',
            description: 'Invalid credentials or server error. Please try again.',
            variant: 'destructive',
        });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border border-border/50"> {/* Added subtle border */}
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full inline-block"> {/* Icon background */}
            <ShieldCheck className="h-12 w-12 text-primary" /> {/* Changed icon */}
        </div>
        <CardTitle className="text-3xl font-bold text-primary">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-lg"> {/* Slightly larger description */}
          {mode === 'signin' ? 'Sign in to AetherAssist.' : 'Join AetherAssist today.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="focus:ring-primary focus:border-primary text-base" /* Ensure primary ring, text size */
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
              className="focus:ring-primary focus:border-primary text-base"
            />
          </div>
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="focus:ring-primary focus:border-primary text-base"
              />
            </div>
          )}
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 rounded-lg" disabled={isLoading}> {/* Rounded-lg */}
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-3 pt-6"> {/* Increased pt and space-y */}
        <p className="text-sm text-muted-foreground">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <Link href={mode === 'signin' ? '/auth/sign-up' : '/auth/sign-in'} className="font-semibold text-accent hover:underline">
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </Link>
        </p>
        {mode === 'signin' && (
             <Link href="#" className="text-sm text-muted-foreground hover:text-accent hover:underline">
                Forgot password?
             </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
