import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, BrainCircuit } from 'lucide-react'; // Changed icon for logo

const AppHeader = () => {
  return (
    <header className="bg-card text-card-foreground shadow-md sticky top-0 z-50 border-b"> {/* Changed background to card for contrast with potential page gradient */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          {/* Using a more abstract/techy icon */}
          <BrainCircuit className="h-8 w-8 text-primary group-hover:text-accent transition-colors" aria-label="AetherAssist Logo" />
          <h1 className="text-2xl font-bold tracking-tight text-primary group-hover:text-accent transition-colors">AetherAssist</h1>
        </Link>
        <nav className="space-x-2">
          <Button variant="ghost" asChild className="text-foreground hover:bg-accent/10 hover:text-accent">
            <Link href="/auth/sign-in">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
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
