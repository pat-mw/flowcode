'use client';

import { Play } from "lucide-react";
import { useState } from "react";

export interface VideoSectionProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  videoUrl?: string;
}

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  // Handle youtu.be short links
  const shortLinkMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortLinkMatch) return shortLinkMatch[1];

  // Handle youtube.com/watch?v= links
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];

  // Handle youtube.com/embed/ links
  const embedMatch = url.match(/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];

  // If it's just the video ID
  if (url.match(/^[a-zA-Z0-9_-]{11}$/)) return url;

  return null;
};

const VideoSection = ({
  sectionTitle = "See webcn in Action",
  sectionSubtitle = "Watch how we're reimagining what's possible in Webflow",
  videoUrl = "",
}: VideoSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoId = getYouTubeVideoId(videoUrl);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  const handlePlayClick = () => {
    if (videoId) {
      setIsPlaying(true);
    }
  };

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

        {/* Video Container */}
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-glow border border-border/50 bg-muted/50 animate-scale-in">
          {isPlaying && videoId ? (
            // YouTube iframe embed with autoplay
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // Thumbnail with play button
            <button
              onClick={handlePlayClick}
              className="relative w-full h-full group cursor-pointer bg-transparent border-0 p-0"
              disabled={!videoId}
              aria-label="Play video"
            >
              {/* YouTube Thumbnail Background */}
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Video thumbnail"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
              )}

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm transition-all group-hover:backdrop-blur-md">
                <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center transition-transform group-hover:scale-110 shadow-glow">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                </div>
              </div>
            </button>
          )}
        </div>

        {!videoUrl && (
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Configure video URL in the properties panel
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoSection;
