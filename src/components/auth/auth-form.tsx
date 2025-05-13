'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Changed from 'next/navigation'
import { Loader2 } from 'lucide-react';

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
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16 text-primary mx-auto">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                 <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" opacity="0.3"/>
            </svg>
        </div>
        <CardTitle className="text-3xl font-bold text-primary">
          {mode === 'signin' ? 'Welcome Back to AetherAssist' : 'Join AetherAssist'}
        </CardTitle>
        <CardDescription>
          {mode === 'signin' ? 'Sign in to continue your session.' : 'Create an account to get started.'}
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
              className="focus:ring-accent"
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
              className="focus:ring-accent"
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
                className="focus:ring-accent"
              />
            </div>
          )}
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
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
