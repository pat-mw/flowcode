'use client';

import { useAuthStore } from '@/lib/stores/authStore';

export interface HelloUserProps {
  userName?: string;
  variant?: 'default' | 'large' | 'minimal';
  showGreeting?: boolean;
}

export default function HelloUser({
  userName,
  variant = 'default',
  showGreeting = true,
}: HelloUserProps) {
  const { user, isAuthenticated } = useAuthStore();

  // Use provided userName, or fall back to authenticated user, or default
  const displayName = userName || (isAuthenticated ? user?.name || user?.email : 'Guest');

  const greeting = showGreeting ? 'Hello, ' : '';

  const sizeClasses = {
    default: 'text-2xl md:text-3xl',
    large: 'text-3xl md:text-5xl',
    minimal: 'text-xl md:text-2xl',
  };

  const paddingClasses = {
    default: 'py-4 px-6',
    large: 'py-6 px-8',
    minimal: 'py-2 px-4',
  };

  return (
    <div
      className={`flex items-center justify-center ${paddingClasses[variant]}`}
    >
      <h1 className={`font-bold text-foreground ${sizeClasses[variant]}`}>
        {greeting}
        <span className="text-primary">{displayName}</span>
      </h1>
    </div>
  );
}
