
'use client';

import Link from 'next/link';
import UserAvatarDropdown from './user-avatar-dropdown';
import { BrainCircuit } from 'lucide-react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="bg-card text-card-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2 text-xl font-semibold text-primary hover:opacity-80 transition-opacity">
            <BrainCircuit className="h-7 w-7" />
            <span>AetherAssist Dashboard</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Back to Chat
            </Link>
            <UserAvatarDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
