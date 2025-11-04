'use client';

import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <HeroSection />
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          BlogFlow - Built with Next.js, Webflow, and modern web technologies
        </div>
      </footer>
    </div>
  );
}
