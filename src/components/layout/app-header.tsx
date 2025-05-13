import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

const AppHeader = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-accent"
            aria-label="AetherAssist Logo"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" opacity="0.3"/>
          </svg>
          <h1 className="text-2xl font-bold tracking-tight">AetherAssist</h1>
        </Link>
        <nav className="space-x-2">
          <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80 hover:text-accent">
            <Link href="/auth/sign-in">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-accent text-accent hover:bg-accent hover:text-primary-foreground">
            <Link href="/auth/sign-up">
              <UserPlus className="mr-2 h-4 w-4" /> Sign Up
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
