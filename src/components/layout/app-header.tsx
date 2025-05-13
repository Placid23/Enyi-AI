
'use client'; 

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Sun, Moon, Languages, Smile, LayoutDashboard } from 'lucide-react'; 
import { useTheme } from '@/hooks/use-theme';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/context/auth-context'; 
import UserAvatarDropdown from '@/components/dashboard/user-avatar-dropdown';

interface AppHeaderProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  onFacialSentimentClick: () => void; 
}

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '中文 (简体)' }, 
  { value: 'pcm', label: 'Nigerian Pidgin' },
  { value: 'fr', label: 'Français' }, 
  { value: 'es', label: 'Español' }, 
  { value: 'de', label: 'Deutsch' },
  { value: 'ko', label: '한국어' }, 
  { value: 'hi', label: 'हिन्दी' }, 
  { value: 'ar', label: 'العربية' }, 
];

const AppHeader = ({ currentLanguage, onLanguageChange, onFacialSentimentClick }: AppHeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading } = useAuth();

  return (
    <header className="bg-card text-card-foreground shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between h-16">
        {/* Left side: Language Select */}
        <div className="flex items-center">
          <Select value={currentLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger 
              className="w-auto min-w-[135px] text-sm h-10 px-3.5 border-border/70 hover:bg-muted/50 focus:ring-accent rounded-lg" 
              aria-label="Select language"
            >
              <div className="flex items-center">
                <Languages className="h-4.5 w-4.5 mr-2.5 opacity-75" />
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
        
        {/* Right side: Navigation */}
        <nav className="space-x-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onFacialSentimentClick} 
            aria-label="Facial Sentiment Analysis"
            className="text-muted-foreground hover:bg-muted/50 hover:text-foreground h-10 w-10 rounded-lg"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="text-muted-foreground hover:bg-muted/50 hover:text-foreground h-10 w-10 rounded-lg"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {!isLoading && user ? (
            <UserAvatarDropdown />
          ) : !isLoading && !user ? (
            <>
              <Button variant="ghost" asChild className="text-foreground hover:bg-muted/50 hover:text-foreground h-10 px-4 rounded-lg">
                <Link href="/auth/sign-in">
                  <LogIn className="mr-2 h-4.5 w-4.5" /> Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-primary/70 text-primary hover:bg-primary hover:text-primary-foreground h-10 px-4 rounded-lg">
                <Link href="/auth/sign-up">
                  <UserPlus className="mr-2 h-4.5 w-4.5" /> Sign Up
                </Link>
              </Button>
            </>
          ) : null /* Show nothing during auth loading state */}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
