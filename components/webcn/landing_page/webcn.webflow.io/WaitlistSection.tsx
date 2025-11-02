'use client';

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import WaitlistCapture from "@/components/waitlist/WaitlistCapture";
import { orpc } from "@/lib/orpc-client";

export interface WaitlistSectionProps {
  badgeText?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  formTitle?: string;
  formSubtitle?: string;
  buttonText?: string;
  successMessage?: string;
  showNameField?: boolean;
  showBadge?: boolean;
}

const WaitlistSection = ({
  badgeText = "Join the Waitlist",
  sectionTitle = "Be Among the First",
  sectionSubtitle = "Get early access to webcn and be part of the future of Webflow development",
  formTitle = "Reserve Your Spot",
  formSubtitle = "Join thousands of developers already on the list",
  buttonText = "Join Waitlist",
  successMessage = "🎉 You're in! We'll notify you when we launch.",
  showNameField = true,
  showBadge = true,
}: WaitlistSectionProps) => {
  // Fetch public waitlist statistics (no auth required)
  const { data: stats } = useQuery(orpc.waitlist.getPublicStats.queryOptions());

  // Format the count with commas
  const formatCount = (count: number) => {
    return new Intl.NumberFormat('en-US').format(count);
  };

  const waitlistCount = stats?.total || 0;
  const displayCount = waitlistCount > 0 ? formatCount(waitlistCount) : "5,000";
  return (
    <section id="waitlist" className="py-24 px-4 relative overflow-hidden border-t border-border/50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            {showBadge && (
              <Badge className="bg-gradient-primary text-primary-foreground">
                {badgeText}
              </Badge>
            )}
            <h2 className="text-4xl md:text-5xl font-bold">
              {sectionTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {sectionSubtitle}
            </p>
          </div>

          {/* Waitlist Form */}
          <div className="max-w-xl mx-auto">
            <WaitlistCapture
              title={formTitle}
              subtitle={formSubtitle}
              buttonText={buttonText}
              successMessage={successMessage}
              showNameField={showNameField}
              showCompanyField={false}
              referralSource="webcn-landing"
              placeholderEmail="Enter your email"
              placeholderName="Your name (optional)"
            />
          </div>

          {/* Bottom Note */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              {waitlistCount > 0 ? (
                <>
                  Join <span className="font-semibold text-primary">{displayCount}+</span> developers already on the list
                </>
              ) : (
                <>
                  Be the first to join the waitlist
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;
