'use client';

import LoginForm from '@/components/LoginForm';
import Navigation from '@/components/Navigation';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <LoginForm />
      </main>
    </div>
  );
}
