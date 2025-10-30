import { Play } from "lucide-react";

export interface VideoSectionProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  placeholderText?: string;
}

const VideoSection = ({
  sectionTitle = "See webcn in Action",
  sectionSubtitle = "Watch how we're reimagining what's possible in Webflow",
  placeholderText = "Full demo video coming soon",
}: VideoSectionProps) => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground">
            {sectionSubtitle}
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-glow border border-border/50 bg-muted/50 animate-scale-in group cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm transition-all group-hover:backdrop-blur-md">
            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center transition-transform group-hover:scale-110 shadow-glow">
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </div>
          </div>
          
          {/* Mock video content */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            {placeholderText}
          </p>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
