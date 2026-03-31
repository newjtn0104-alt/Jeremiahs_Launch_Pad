"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SweetSaying from "./SweetSaying";
import TastyTargets from "./TastyTargets";
import FroggyFocuses from "./FroggyFocuses";
import SweetStart from "./SweetStart";
import WhosWorking from "./WhosWorking";
import QuickLinks from "./QuickLinks";
import RevelClosingLive from "./RevelClosingLive";

type TabType = "whosWorking" | "tastyTargets" | "quickLinks" | "froggyFocuses" | "sweetStart" | "revelClosing";

const tabs = [
  { id: "whosWorking" as TabType, label: "Who's Working", icon: "👥", color: "from-blue-500 to-blue-600", desc: "Current staff" },
  { id: "tastyTargets" as TabType, label: "Tasty Targets", icon: "🎯", color: "from-green-500 to-green-600", desc: "Daily goals" },
  { id: "quickLinks" as TabType, label: "Quick Links", icon: "🔗", color: "from-purple-500 to-purple-600", desc: "Resources" },
  { id: "froggyFocuses" as TabType, label: "Froggy Focuses", icon: "🐸", color: "from-yellow-500 to-yellow-600", desc: "Daily tasks" },
  { id: "sweetStart" as TabType, label: "Sweet Start", icon: "🚀", color: "from-pink-500 to-pink-600", desc: "Quick actions" },
  { id: "revelClosing" as TabType, label: "Revel Closing", icon: "📊", color: "from-indigo-500 to-indigo-600", desc: "Sales data" },
];

export default function LaunchPad() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabType>("whosWorking");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleTabChange = (tabId: TabType) => {
    setIsLoading(true);
    setActiveTab(tabId);
    setTimeout(() => setIsLoading(false), 300);
  };

  const renderActiveComponent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 animate-fade-in">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }

    const components = {
      whosWorking: <WhosWorking />,
      tastyTargets: <TastyTargets />,
      quickLinks: <QuickLinks />,
      froggyFocuses: <FroggyFocuses />,
      sweetStart: <SweetStart />,
      revelClosing: <RevelClosingLive />,
    };

    return (
      <div className="animate-slide-up">
        {components[activeTab]}
      </div>
    );
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen p-6">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <header className="text-center space-y-2 animate-fade-in">
          <h1 className="text-6xl font-bold tracking-tight gradient-text drop-shadow-2xl">
            The Launch Pad
          </h1>
          <p className="text-xl text-white/60 font-light tracking-wide">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        {/* Sweet Saying */}
        <SweetSaying />

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar */}
          <Card className="h-fit sticky top-6">
            <CardHeader>
              <CardTitle className="text-xl">Navigation</CardTitle>
              <CardDescription>Select a section</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r shadow-lg scale-[1.02]"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                    style={{
                      background: activeTab === tab.id 
                        ? `linear-gradient(135deg, ${tab.color.includes('blue') ? 'rgba(59, 130, 246, 0.3)' : tab.color.includes('green') ? 'rgba(34, 197, 94, 0.3)' : tab.color.includes('purple') ? 'rgba(168, 85, 247, 0.3)' : tab.color.includes('yellow') ? 'rgba(234, 179, 8, 0.3)' : tab.color.includes('pink') ? 'rgba(236, 72, 153, 0.3)' : 'rgba(99, 102, 241, 0.3)'} 0%, transparent 100%)`
                        : undefined
                    }}
                  >
                    {/* Active indicator */}
                    {activeTab === tab.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/50 to-transparent rounded-l-xl" />
                    )}
                    
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{tab.icon}</span>
                      <div className="text-left">
                        <div className={`font-semibold ${activeTab === tab.id ? 'text-white' : 'text-white/80'}`}>
                          {tab.label}
                        </div>
                        <div className="text-xs text-white/50">{tab.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="min-h-[600px]">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeTabData?.icon}</span>
                  <div>
                    <CardTitle>{activeTabData?.label}</CardTitle>
                    <CardDescription>{activeTabData?.desc}</CardDescription>
                  </div>
                </div>
                {isLoading && (
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {renderActiveComponent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
