/**
 * RegistrationForm Component
 * User registration form with Better Auth integration
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp, signIn } from '@/lib/auth/client';
import { useAuthStore } from '@/lib/stores/authStore';
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
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<RegistrationFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

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

      // Auto-login after registration
      const loginResponse = await signIn.email({
        email: data.email,
        password: data.password,
        fetchOptions: {
          onError(context) {
            throw new Error(context.error.message || 'Auto-login failed');
          },
        },
      });

      // Update Zustand auth store
      if (loginResponse.data?.user) {
        // Fetch person profile (created by afterSignUp callback)
        const personResponse = await fetch('/api/orpc/auth.getSession', {
          credentials: 'include',
        });

        if (personResponse.ok) {
          const sessionData = await personResponse.json();

          if (sessionData?.person) {
            setAuth(loginResponse.data.user, sessionData.person);
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
        router.push(redirectTo);
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

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
          <Link href="/auth/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
