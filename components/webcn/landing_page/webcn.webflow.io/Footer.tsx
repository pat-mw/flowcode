'use client';

import { Code2, Github, Twitter } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface FooterProps {
  brandText?: string;
  brandSubtext?: string;
  builderName?: string;
  builderUrl?: string;
  hackathonText?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

const Footer = ({
  brandText = "webcn",
  brandSubtext = "Full-stack React components for Webflow",
  builderName = "UZO LAB",
  builderUrl = "https://uzolab-template.webflow.io",
  hackathonText = "for Webflow x Contra Hackathon",
  githubUrl = "https://github.com",
  twitterUrl = "https://twitter.com",
}: FooterProps) => {
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="border-t border-border/50 py-16 px-4 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="container mx-auto max-w-6xl">
        <div className={`flex flex-col md:flex-row justify-between items-center gap-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-glow">
                <Code2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-primary">
                {brandText}
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
              {brandSubtext}
            </p>
          </div>

          {/* Links */}
          <div className={`flex gap-8 transition-all duration-700 delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <a href="#components" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Components
            </a>
            <a href="#demo" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Demo
            </a>
            <a href="#story" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Story
            </a>
            <a href={githubUrl} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              GitHub
            </a>
          </div>

          {/* Social */}
          <div className={`flex items-center gap-4 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <a
              href={githubUrl}
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transition-transform"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href={twitterUrl}
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transition-transform"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className={`mt-12 pt-8 border-t border-border/50 text-center transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="text-sm text-muted-foreground">
            Built Proudly by{' '}
            <a
              href={builderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors font-semibold"
            >
              {builderName}
            </a>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {hackathonText}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
