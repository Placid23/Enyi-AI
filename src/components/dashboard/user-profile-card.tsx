
'use client';

import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Edit3, Mail, Shield, Bell } from 'lucide-react';

const UserProfileCard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading user data or not logged in.</p>
        </CardContent>
      </Card>
    );
  }
  
  const getInitials = (email: string) => {
    const parts = email.split('@')[0];
    return parts.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20 border-4 border-primary/30">
            {/* <AvatarImage src={user.avatarUrl} alt={user.email} /> */}
            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
              {getInitials(user.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
            <CardDescription>View and manage your account details.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Account Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input id="email" value={user.email} readOnly className="bg-muted/50 border-transparent"/>
              </div>
            </div>
             <div className="space-y-1">
              <Label htmlFor="displayName" className="text-muted-foreground">Display Name (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Edit3 className="h-4 w-4 text-muted-foreground" />
                <Input id="displayName" placeholder="Enter display name" className="bg-card border-input"/>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Security</h3>
           <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-xs text-muted-foreground">Last changed: 3 months ago (mock)</p>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
           <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Currently disabled (mock)</p>
            </div>
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">Enable 2FA</Button>
          </div>
        </div>
        
        <Separator />

         <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Preferences</h3>
           <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates and news</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </div>

      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes (Mock)</Button>
      </CardFooter>
    </Card>
  );
};

export default UserProfileCard;
