"use client";

import { useState, useEffect } from "react";
import SweetSaying from "./SweetSaying";
import TastyTargets from "./TastyTargets";
import FroggyFocuses from "./FroggyFocuses";
import SweetStart from "./SweetStart";
import WhosWorking from "./WhosWorking";
import QuickLinks from "./QuickLinks";
import RevelClosingLive from "./RevelClosingLive";

type TabType = "whosWorking" | "tastyTargets" | "quickLinks" | "froggyFocuses" | "sweetStart" | "revelClosing";

const tabs = [
  { id: "whosWorking" as TabType, label: "👥 Who's Working", color: "bg-blue-500" },
  { id: "tastyTargets" as TabType, label: "🎯 Tasty Targets", color: "bg-green-500" },
  { id: "quickLinks" as TabType, label: "🔗 Quick Links", color: "bg-purple-500" },
  { id: "froggyFocuses" as TabType, label: "🐸 Froggy Focuses", color: "bg-yellow-500" },
  { id: "sweetStart" as TabType, label: "🚀 Sweet Start", color: "bg-pink-500" },
  { id: "revelClosing" as TabType, label: "📊 Revel Closing", color: "bg-indigo-500" },
];

export default function LaunchPad() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabType>("whosWorking");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "whosWorking":
        return <WhosWorking />;
      case "tastyTargets":
        return <TastyTargets />;
      case "quickLinks":
        return <QuickLinks />;
      case "froggyFocuses":
        return <FroggyFocuses />;
      case "sweetStart":
        return <SweetStart />;
      case "revelClosing":
        return <RevelClosingLive />;
      default:
        return <WhosWorking />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
          The Launch Pad
        </h1>
        <p className="text-xl text-blue-200">
          {currentTime.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {/* Sweet Saying - Always Visible at Top */}
      <div className="mb-8">
        <SweetSaying />
      </div>

      {/* Main Layout - Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar with Tab Buttons */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-4 text-center">Dashboard</h3>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? `${tab.color} text-white shadow-lg scale-105`
                      : "bg-white/5 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-[500px]">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-full">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
}
