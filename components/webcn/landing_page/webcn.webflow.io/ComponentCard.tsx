import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export interface ComponentCardProps {
  previewImage?: string;
  componentName?: string;
  category?: string;
  description?: string;
  link?: string;
  buttonText?: string;
  isFullStack?: boolean;
}

const ComponentCard = ({
  previewImage = "",
  componentName = "Component Name",
  category = "UI",
  description = "Component description",
  link = "#",
  buttonText = "View Component",
  isFullStack = false,
}: ComponentCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Preview Area */}
      <div className="aspect-video bg-muted/30 border-b border-border flex items-center justify-center relative overflow-hidden">
        {previewImage ? (
          <img
            src={previewImage}
            alt={componentName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        {!previewImage && (
          <span className="text-muted-foreground text-sm font-mono relative z-10">
            {componentName.toLowerCase().replace(/\s+/g, '-')}-preview
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {componentName}
          </h3>
          <Badge
            variant={isFullStack ? "default" : "secondary"}
            className={
              isFullStack
                ? "bg-primary text-primary-foreground border-0"
                : "bg-secondary text-secondary-foreground"
            }
          >
            {category}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="w-full justify-between hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <a href={link}>
            {buttonText}
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </Card>
  );
};

export default ComponentCard;
