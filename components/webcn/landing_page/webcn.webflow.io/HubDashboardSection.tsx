'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Package,
  Zap,
  CheckCircle2,
  Circle,
  Cloud,
  Link2,
  Play,
  Globe,
  Database,
  Layout
} from "lucide-react";

export interface HubDashboardSectionProps {
  badgeText?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  showBadge?: boolean;
  hubTitle?: string;
  projectName?: string;
  statusText?: string;
}

const HubDashboardSection = ({
  badgeText = "Management Hub",
  sectionTitle = "Control Center for Your Stack",
  sectionSubtitle = "Connect services, install libraries, and configure your backend — all from one dashboard",
  showBadge = true,
  hubTitle = "webcn Hub",
  projectName = "my-webflow-app",
  statusText = "Live",
}: HubDashboardSectionProps) => {
  const [activeTab, setActiveTab] = useState("connect");
  const [connectionStatus, setConnectionStatus] = useState({
    webflow: false,
    vercel: false,
    database: false,
  });
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  // Simulate connection animation
  const handleConnect = (service: keyof typeof connectionStatus) => {
    setIsConnecting(service);
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, [service]: true }));
      setIsConnecting(null);
    }, 1500);
  };

  useEffect(() => {
    // Auto-demo the connections
    const timers = [
      setTimeout(() => handleConnect('webflow'), 1000),
      setTimeout(() => handleConnect('vercel'), 2500),
      setTimeout(() => handleConnect('database'), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const componentLibraries = [
    { name: "Authentication", components: 12, installed: true },
    { name: "Dashboard", components: 8, installed: true },
    { name: "Forms", components: 15, installed: false },
    { name: "Charts", components: 10, installed: false },
  ];

  return (
    <section id="hub" className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            {showBadge && (
              <Badge className="bg-gradient-primary">
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

          {/* Mock Dashboard UI */}
          <Card className="relative overflow-hidden bg-gradient-card border-border/50 shadow-card">
            {/* Dashboard Header */}
            <div className="border-b border-border/50 bg-secondary/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Layout className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{hubTitle}</h3>
                    <p className="text-xs text-muted-foreground">Project: {projectName}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 border-primary/30">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
                  {statusText}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-[auto,1fr] md:grid-cols-[200px,1fr] lg:grid-cols-[240px,1fr] min-h-[500px]">
              {/* Sidebar */}
              <div className="border-r border-border/50 bg-secondary/20 p-2 md:p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("connect")}
                    className={`w-full flex items-center gap-2 md:gap-3 px-2 md:px-4 py-3 rounded-lg text-sm transition-all ${
                      activeTab === "connect"
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Link2 className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Connections</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("libraries")}
                    className={`w-full flex items-center gap-2 md:gap-3 px-2 md:px-4 py-3 rounded-lg text-sm transition-all ${
                      activeTab === "libraries"
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Package className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Libraries</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center gap-2 md:gap-3 px-2 md:px-4 py-3 rounded-lg text-sm transition-all ${
                      activeTab === "settings"
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Settings</span>
                  </button>
                </nav>
              </div>

              {/* Main Content */}
              <div className="p-4 md:p-6 lg:p-8">
                {activeTab === "connect" && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Connect Your Services</h3>
                      <p className="text-sm text-muted-foreground">
                        Link your accounts to deploy and manage your application
                      </p>
                    </div>

                    {/* Connection Cards */}
                    <div className="space-y-4">
                      {/* Webflow */}
                      <div className={`p-5 rounded-lg border-2 transition-all duration-500 ${
                        connectionStatus.webflow
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/30 bg-secondary/20'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                              <Globe className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Webflow</h4>
                              <p className="text-sm text-muted-foreground">
                                {connectionStatus.webflow ? "Connected to workspace" : "Connect your Webflow site"}
                              </p>
                            </div>
                          </div>
                          {connectionStatus.webflow ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : isConnecting === 'webflow' ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground/30" />
                          )}
                        </div>
                      </div>

                      {/* Vercel */}
                      <div className={`p-5 rounded-lg border-2 transition-all duration-500 ${
                        connectionStatus.vercel
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/30 bg-secondary/20'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                              <Cloud className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Vercel</h4>
                              <p className="text-sm text-muted-foreground">
                                {connectionStatus.vercel ? "Deployed and running" : "Deploy your Next.js backend"}
                              </p>
                            </div>
                          </div>
                          {connectionStatus.vercel ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : isConnecting === 'vercel' ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground/30" />
                          )}
                        </div>
                      </div>

                      {/* Database */}
                      <div className={`p-5 rounded-lg border-2 transition-all duration-500 ${
                        connectionStatus.database
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/30 bg-secondary/20'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                              <Database className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Database</h4>
                              <p className="text-sm text-muted-foreground">
                                {connectionStatus.database ? "Vercel Postgres connected" : "Choose: Vercel, Supabase, or Neon"}
                              </p>
                            </div>
                          </div>
                          {connectionStatus.database ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : isConnecting === 'database' ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground/30" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Deploy Button */}
                    {Object.values(connectionStatus).every(status => status) && (
                      <div className="pt-4 animate-scale-in">
                        <Button
                          size="lg"
                          className="w-full bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Deploy Application
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "libraries" && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Component Libraries</h3>
                      <p className="text-sm text-muted-foreground">
                        Select and install component collections for your project
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {componentLibraries.map((library, index) => (
                        <div
                          key={library.name}
                          className="p-5 rounded-lg border border-border/30 bg-secondary/20 hover:border-primary/30 transition-all"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{library.name}</h4>
                                  {library.installed && (
                                    <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">
                                      Installed
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {library.components} components
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={library.installed ? "outline" : "default"}
                              className={library.installed ? "" : "bg-primary"}
                            >
                              {library.installed ? "Manage" : "Install"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Project Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure your project and deployment settings
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-border/30 bg-secondary/20">
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-medium text-sm">Environment</label>
                          <Badge variant="outline">Production</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Current deployment environment
                        </p>
                      </div>

                      <div className="p-4 rounded-lg border border-border/30 bg-secondary/20">
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-medium text-sm">Auto Deploy</label>
                          <div className="w-10 h-6 bg-primary rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-primary-foreground rounded-full"></div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Automatically deploy on git push
                        </p>
                      </div>

                      <div className="p-4 rounded-lg border border-border/30 bg-secondary/20">
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-medium text-sm">Build Command</label>
                        </div>
                        <code className="text-xs bg-secondary/50 px-2 py-1 rounded">
                          pnpm build
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Bottom Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">One-Click Setup</h4>
              <p className="text-sm text-muted-foreground">
                Connect your accounts and deploy in minutes
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Modular Libraries</h4>
              <p className="text-sm text-muted-foreground">
                Install only what you need, when you need it
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Full Control</h4>
              <p className="text-sm text-muted-foreground">
                Configure every aspect of your deployment
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              No complex configuration. No DevOps expertise required. Just connect and deploy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HubDashboardSection;
