
'use client';

import UserProfileDisplay from '@/components/profile/user-profile-display';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback, prevent rendering if user is null post-loading.
    return null; 
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-secondary/10 h-full">
      <UserProfileDisplay />
    </div>
  );
}
