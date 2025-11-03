'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileEditor() {
  const queryClient = useQueryClient();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [website, setWebsite] = useState('');

  // Fetch current profile
  const { data: profile, isLoading, error } = useQuery(
    orpc.people.getMe.queryOptions({})
  );

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setAvatar(profile.avatar || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  // Update mutation
  const updateMutation = useMutation(
    orpc.people.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.people.getMe.queryKey() });
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        toast.error(`Failed to update profile: ${error.message}`);
      },
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    // Validate URL fields
    if (avatar && !isValidUrl(avatar)) {
      toast.error('Avatar must be a valid URL');
      return;
    }

    if (website && !isValidUrl(website)) {
      toast.error('Website must be a valid URL');
      return;
    }

    updateMutation.mutate({
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
      avatar: avatar.trim() || undefined,
      website: website.trim() || undefined,
    });
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-gray-600">Update your public profile information</p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-semibold">Error loading profile</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Profile form */}
      {!isLoading && !error && profile && (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                This information will be displayed publicly on your posts
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  required
                  maxLength={255}
                />
                <p className="text-sm text-gray-500">
                  How your name will appear on your posts
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell readers a bit about yourself..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500">
                  {bio.length}/500 characters
                </p>
              </div>

              {/* Avatar URL */}
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-sm text-gray-500">
                  URL to your profile picture (must be a valid URL)
                </p>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
                <p className="text-sm text-gray-500">
                  Your personal website or blog (must be a valid URL)
                </p>
              </div>

              {/* Avatar Preview */}
              {avatar && isValidUrl(avatar) && (
                <div className="space-y-2">
                  <Label>Avatar Preview</Label>
                  <div className="flex items-center gap-4">
                    <img
                      src={avatar}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        toast.error('Failed to load avatar image');
                      }}
                    />
                    <p className="text-sm text-gray-500">
                      This is how your avatar will appear
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => (window.location.href = '/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
