import { Code2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NavbarProps {
  logoText?: string;
  logoLink?: {
    href: string;
    target?: "_self" | "_blank" | string;
    preload?: "prerender" | "prefetch" | "none" | string;
  };
  githubUrl?: string;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  showGithubLink?: boolean;
  // Navigation Links
  link1Label?: string;
  link1Url?: string;
  showLink1?: boolean;
  link2Label?: string;
  link2Url?: string;
  showLink2?: boolean;
  link3Label?: string;
  link3Url?: string;
  showLink3?: boolean;
  link4Label?: string;
  link4Url?: string;
  showLink4?: boolean;
}

const Navbar = ({
  logoText = "webcn",
  logoLink,
  githubUrl = "https://github.com",
  ctaButtonText = "Get Started",
  ctaButtonUrl = "#get-started",
  showGithubLink = true,
  // Navigation Links - defaults match current behavior
  link1Label = "Features",
  link1Url = "#features",
  showLink1 = true,
  link2Label = "Components",
  link2Url = "#components",
  showLink2 = true,
  link3Label = "Demo",
  link3Url = "#demo",
  showLink3 = true,
  link4Label = "Story",
  link4Url = "#story",
  showLink4 = true,
}: NavbarProps) => {
  // Build navigation links array from props
  const navLinks = [
    { label: link1Label, url: link1Url, show: showLink1 },
    { label: link2Label, url: link2Url, show: showLink2 },
    { label: link3Label, url: link3Url, show: showLink3 },
    { label: link4Label, url: link4Url, show: showLink4 },
  ].filter(link => link.show && link.label && link.url);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a
            href={logoLink?.href || "/"}
            target={logoLink?.target}
            rel={logoLink?.target === "_blank" ? "noopener noreferrer" : undefined}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">
              {logoText}
            </span>
          </a>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
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
            <a href={ctaButtonUrl}>
              <Button size="sm" className="shadow-glow">
                {ctaButtonText}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
