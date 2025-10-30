'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Loader2, Mail, User, Building2 } from 'lucide-react';
import { orpc } from '@/lib/orpc-client';

export interface WaitlistCaptureProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  successMessage?: string;
  showNameField?: boolean;
  showCompanyField?: boolean;
  referralSource?: string;
  placeholderEmail?: string;
  placeholderName?: string;
  placeholderCompany?: string;
}

const WaitlistCapture = ({
  title = 'Join the Waitlist',
  subtitle = 'Be the first to know when we launch. Get exclusive early access.',
  buttonText = 'Join Waitlist',
  successMessage = "You're on the list! We'll be in touch soon.",
  showNameField = true,
  showCompanyField = false,
  referralSource,
  placeholderEmail = 'Enter your email',
  placeholderName = 'Your name',
  placeholderCompany = 'Company name',
}: WaitlistCaptureProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const joinMutation = useMutation(
    orpc.waitlist.join.mutationOptions({
      onSuccess: () => {
        setIsSuccess(true);
        setEmail('');
        setName('');
        setCompany('');
      },
    })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    joinMutation.mutate({
      email,
      name: showNameField && name ? name : undefined,
      company: showCompanyField && company ? company : undefined,
      referralSource,
    });
  };

  if (isSuccess) {
    return (
      <Card className="p-8 bg-gradient-card border-border/50 shadow-card">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Success!</h3>
            <p className="text-muted-foreground">{successMessage}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsSuccess(false)}
            className="mt-4"
          >
            Join Another Email
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-gradient-card border-border/50 shadow-card">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholderEmail}
                required
                className="pl-10"
                disabled={joinMutation.isPending}
              />
            </div>
          </div>

          {/* Name Field */}
          {showNameField && (
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={placeholderName}
                  className="pl-10"
                  disabled={joinMutation.isPending}
                />
              </div>
            </div>
          )}

          {/* Company Field */}
          {showCompanyField && (
            <div className="space-y-2">
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={placeholderCompany}
                  className="pl-10"
                  disabled={joinMutation.isPending}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {joinMutation.error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive">
                {joinMutation.error instanceof Error
                  ? joinMutation.error.message
                  : 'Failed to join waitlist'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={joinMutation.isPending}
            size="lg"
          >
            {joinMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>We respect your privacy. No spam, ever.</p>
        </div>
      </div>
    </Card>
  );
};

export default WaitlistCapture;
