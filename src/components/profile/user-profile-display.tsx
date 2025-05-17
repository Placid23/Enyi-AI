
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Edit3, Settings, Activity, User as UserIcon } from 'lucide-react';

export default function UserProfileDisplay() {
  const { user } = useAuth();

  // Determine user name and initials safely
  const emailParts = user?.email?.split('@');
  const userName = emailParts?.[0] || 'Enyi User';
  const userEmail = user?.email || 'user@example.com';
  const userInitials = userName.length > 0 ? userName.substring(0, 2).toUpperCase() : 'EU';


  return (
    <Card className="w-full max-w-md mx-auto shadow-xl rounded-xl">
      <CardHeader className="items-center text-center p-6">
        <div className="relative mb-4">
          <Avatar className="w-32 h-32 text-4xl border-4 border-primary/20 shadow-lg">
            <AvatarImage src="https://placehold.co/200x200.png" alt={userName} data-ai-hint="profile person" />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl font-bold">{userName}</CardTitle>
        <CardDescription className="text-muted-foreground">{userEmail}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <Button variant="outline" className="w-full justify-start text-base py-3 rounded-lg hover:bg-accent/10 hover:border-accent">
          <Edit3 className="mr-3 h-5 w-5 text-primary" /> Edit Profile
        </Button>
        <Button variant="outline" className="w-full justify-start text-base py-3 rounded-lg hover:bg-accent/10 hover:border-accent">
          <Settings className="mr-3 h-5 w-5 text-primary" /> Account Settings
        </Button>
        <Button variant="outline" className="w-full justify-start text-base py-3 rounded-lg hover:bg-accent/10 hover:border-accent">
          <Activity className="mr-3 h-5 w-5 text-primary" /> View Activity
        </Button>
      </CardContent>
      <CardFooter className="p-6 justify-center">
        {/* Footer can be used for other links, e.g., privacy policy or terms */}
      </CardFooter>
    </Card>
  );
}
