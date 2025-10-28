/**
 * RegistrationForm Component
 * User registration form with Better Auth integration
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signUp, signIn } from '@/lib/auth/client';
import { useAuthStore } from '@/lib/stores/authStore';
import { setToken } from '@/lib/token-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Validation schema
const registrationSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

export default function RegistrationForm({
  redirectTo = '/dashboard',
  onSuccess,
}: RegistrationFormProps) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Check if Google OAuth is configured
  const isGoogleConfigured = typeof window !== 'undefined' &&
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED);

  const form = useForm<RegistrationFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await signIn.social({
        provider: 'google',
        callbackURL: redirectTo,
      });

      // Note: After Google OAuth redirect, user will be redirected to callbackURL
      // The session will be established and we'll handle auth state in a useEffect
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate with Zod
      const validationResult = registrationSchema.safeParse(data);
      if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors;
        if (errors.name?.[0]) {
          form.setError('name', { message: errors.name[0] });
        }
        if (errors.email?.[0]) {
          form.setError('email', { message: errors.email[0] });
        }
        if (errors.password?.[0]) {
          form.setError('password', { message: errors.password[0] });
        }
        if (errors.confirmPassword?.[0]) {
          form.setError('confirmPassword', { message: errors.confirmPassword[0] });
        }
        setIsLoading(false);
        return;
      }

      // Call Better Auth signUp
      const signUpResponse = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        fetchOptions: {
          onError(context) {
            throw new Error(context.error.message || 'Registration failed');
          },
        },
      });

      if (!signUpResponse.data?.user) {
        throw new Error('Registration failed - no user returned');
      }

      // Auto-login after registration - call API directly to get session token
      const loginAuthResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!loginAuthResponse.ok) {
        const errorData = await loginAuthResponse.json().catch(() => ({ message: 'Auto-login failed' }));
        throw new Error(errorData.message || 'Auto-login failed');
      }

      const loginAuthData = await loginAuthResponse.json();

      if (!loginAuthData?.user) {
        throw new Error('Auto-login failed - no user returned');
      }

      // Extract session token for bearer authentication
      const sessionToken = loginAuthData.session?.token || loginAuthData.token;

      if (sessionToken) {
        setToken(sessionToken);
        console.log('[Registration] ✅ Bearer token stored');
      } else {
        console.warn('[Registration] No session token in response');
      }

      const loginResponse = { data: loginAuthData }; // Normalize response format

      // Update Zustand auth store
      if (loginResponse.data?.user) {

        // Fetch person profile (created by afterSignUp callback)
        const personResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orpc/auth/getSession`, {
          method: 'POST',
          credentials: 'include',
        });

        if (personResponse.ok) {
          const sessionData = await personResponse.json();

          if (sessionData?.json?.person) {
            setAuth(loginResponse.data.user, sessionData.json.person);
          } else {
            // Create a minimal person object if not found
            setAuth(loginResponse.data.user, {
              id: '',
              userId: loginResponse.data.user.id,
              displayName: loginResponse.data.user.name,
              bio: null,
              avatar: loginResponse.data.user.image || null,
              website: null,
            });
          }
        }

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Redirect to dashboard or specified route
        window.location.href = redirectTo;
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred during registration'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create your account</CardTitle>
        <CardDescription className="text-center">
          Join BlogFlow to start creating and managing your blog
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || !isGoogleConfigured}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </TooltipTrigger>
            {!isGoogleConfigured && (
              <TooltipContent>
                <p>Google OAuth not configured</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      autoComplete="name"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Create a password (min. 8 characters)"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/auth/login" className="text-primary hover:underline">
            Login
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
