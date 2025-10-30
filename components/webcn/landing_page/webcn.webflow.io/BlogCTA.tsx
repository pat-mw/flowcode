import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BlogCTA = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-8 md:p-12 bg-gradient-card border-primary/20 shadow-glow animate-fade-up">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Deep Dive: Building Full-Stack Webflow Apps
              </h2>
              <p className="text-muted-foreground mb-6">
                Read our technical breakdown of how webcn brings React&apos;s full ecosystem to Webflow, complete with authentication, databases, and more.
              </p>
              <Button size="lg" className="shadow-glow">
                Read the Blog Post
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default BlogCTA;
