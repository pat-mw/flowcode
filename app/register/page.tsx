'use client';

import RegistrationForm from '@/components/RegistrationForm';
import Navigation from '@/components/Navigation';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <RegistrationForm />
      </main>
    </div>
  );
}
