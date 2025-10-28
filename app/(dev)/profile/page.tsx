'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ProfileEditorContent() {
  const { user, person } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
            <p className="text-lg text-muted-foreground">
              Manage your author profile and account settings
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Profile</CardTitle>
                <CardDescription>
                  Your current profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                    <p className="text-lg">{person?.displayName || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg">{user?.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p className="text-lg">{person?.bio || 'No bio yet'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Website</p>
                    <p className="text-lg">{person?.website || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avatar</p>
                    <p className="text-lg">{person?.avatar ? 'Set' : 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ProfileEditor Component</CardTitle>
                <CardDescription>
                  Edit your profile information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-8 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground mb-4">
                    ProfileEditor component will be implemented here
                  </p>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Features:</p>
                    <ul className="list-disc list-inside">
                      <li>Edit display name</li>
                      <li>Update bio and description</li>
                      <li>Upload profile avatar</li>
                      <li>Add website and social links</li>
                      <li>Change email preferences</li>
                      <li>Account security settings</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button disabled>
                    Save Changes (Coming Soon)
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileEditorContent />
    </ProtectedRoute>
  );
}
