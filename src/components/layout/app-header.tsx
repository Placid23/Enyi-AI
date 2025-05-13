
'use client'; 

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Sun, Moon, Languages } from 'lucide-react'; // Removed BrainCircuit
import { useTheme } from '@/hooks/use-theme';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppHeaderProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '中文 (简体)' }, // Simplified Chinese
  { value: 'pcm', label: 'Nigerian Pidgin' },
  { value: 'fr', label: 'Français' }, // French
  { value: 'es', label: 'Español' }, // Spanish
  { value: 'de', label: 'Deutsch' }, // German
];

const AppHeader = ({ currentLanguage, onLanguageChange }: AppHeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card text-card-foreground shadow-md sticky top-0 z-50"> {/* Removed border-b */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side: Language Select */}
        <div className="flex items-center">
          <Select value={currentLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger 
              className="w-auto min-w-[130px] text-sm h-9 px-3 border-border hover:bg-accent/10 focus:ring-accent" 
              aria-label="Select language"
            >
              <div className="flex items-center">
                <Languages className="h-4 w-4 mr-2 opacity-70" />
                <SelectValue placeholder="Language" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Right side: Navigation (Theme, Sign In, Sign Up) */}
        <nav className="space-x-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="text-foreground hover:bg-accent/10 hover:text-accent h-9 w-9"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" asChild className="text-foreground hover:bg-accent/10 hover:text-accent h-9 px-3">
            <Link href="/auth/sign-in">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-accent text-accent hover:bg-accent hover:text-accent-foreground h-9 px-3">
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
