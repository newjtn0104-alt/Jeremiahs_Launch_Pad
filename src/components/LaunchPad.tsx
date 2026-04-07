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
import CRM from "./CRM";

type TabType = "whosWorking" | "tastyTargets" | "quickLinks" | "froggyFocuses" | "sweetStart" | "revelClosing" | "crm";

const tabs = [
  { id: "whosWorking" as TabType, label: "Who's Working", icon: "👥", color: "bg-blue-600", desc: "Current staff" },
  { id: "tastyTargets" as TabType, label: "Tasty Targets", icon: "🎯", color: "bg-emerald-600", desc: "Daily goals" },
  { id: "quickLinks" as TabType, label: "Quick Links", icon: "🔗", color: "bg-violet-600", desc: "Resources" },
  { id: "froggyFocuses" as TabType, label: "Froggy Focuses", icon: "🐸", color: "bg-amber-600", desc: "Daily tasks" },
  { id: "sweetStart" as TabType, label: "Sweet Start", icon: "🚀", color: "bg-rose-600", desc: "Quick actions" },
  { id: "revelClosing" as TabType, label: "Revel Closing", icon: "📊", color: "bg-indigo-600", desc: "Sales data" },
  { id: "crm" as TabType, label: "CRM", icon: "👤", color: "bg-pink-600", desc: "Customer management" },
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
          <Skeleton className="h-8 w-3/4 bg-slate-200" />
          <Skeleton className="h-32 w-full bg-slate-200" />
          <Skeleton className="h-32 w-full bg-slate-200" />
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
      crm: <CRM />
    };

    return (
      <div className="animate-slide-up">
        {components[activeTab]}
      </div>
    );
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
            The Launch Pad
          </h1>
          <p className="text-xl text-slate-500">
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
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <Card className="h-fit border-slate-200 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Navigation</CardTitle>
              <CardDescription>Select a section</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? `${tab.color} text-white shadow-md`
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs opacity-80">{tab.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="min-h-[600px] border-slate-200 shadow-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeTabData?.icon}</span>
                <div>
                  <CardTitle className="text-slate-900">{activeTabData?.label}</CardTitle>
                  <CardDescription>{activeTabData?.desc}</CardDescription>
                </div>
              </div>
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
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
  );
}
