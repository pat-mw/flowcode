import { Code2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NavbarProps {
  logoText?: string;
  githubUrl?: string;
  ctaButtonText?: string;
  showGithubLink?: boolean;
}

const Navbar = ({
  logoText = "webcn",
  githubUrl = "https://github.com",
  ctaButtonText = "Get Started",
  showGithubLink = true,
}: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {logoText}
            </span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#components" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Components
            </a>
            <a href="#demo" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Demo
            </a>
            <a href="#story" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Story
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {showGithubLink && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            <Button size="sm" className="shadow-glow">
              {ctaButtonText}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
