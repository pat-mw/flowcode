import { Sparkles, Zap, Target } from "lucide-react";

export interface StorySectionProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  feature1Title?: string;
  feature1Description?: string;
  feature2Title?: string;
  feature2Description?: string;
  feature3Title?: string;
  feature3Description?: string;
}

const StorySection = ({
  sectionTitle = "The Hackathon Story",
  sectionSubtitle = 'Why we\'re building a framework instead of "just another website"',
  feature1Title = "The Challenge",
  feature1Description = "Webflow's new Code Components feature unlocked something powerful: the ability to bring React's ecosystem into Webflow. But nobody had built the infrastructure to make it truly useful.",
  feature2Title = "The Vision",
  feature2Description = "Instead of a traditional landing page submission, we're shipping a complete full-stack framework. Real authentication, databases, and server logic—all running natively in Webflow.",
  feature3Title = "The Impact",
  feature3Description = "webcn isn't just for this hackathon. It's a foundation for developers to build production-ready apps in Webflow, pushing the platform beyond its traditional boundaries.",
}: StorySectionProps) => {
  return (
    <section id="story" className="py-24 px-4 border-t border-border/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{feature1Title}</h3>
            <p className="text-muted-foreground">
              {feature1Description}
            </p>
          </div>

          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{feature2Title}</h3>
            <p className="text-muted-foreground">
              {feature2Description}
            </p>
          </div>

          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{feature3Title}</h3>
            <p className="text-muted-foreground">
              {feature3Description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
