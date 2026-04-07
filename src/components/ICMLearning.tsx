"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Droplets,
  Power,
  Timer,
  AlertCircle,
  RotateCcw
} from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  hotspots: Hotspot[];
  instructions: string[];
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  description: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Drain the Mix",
    description: "Remove all product from the machine before cleaning",
    icon: <Droplets className="w-6 h-6" />,
    image: "/taylor-c712-real.jpg",
    hotspots: [
      { id: "drain-bucket", x: 30, y: 65, label: "Drain Bucket", description: "Place bucket here under the spout to catch drainage" },
      { id: "drain-bucket-2", x: 70, y: 65, label: "Drain Bucket", description: "Place second bucket for other flavor" },
      { id: "dispense-handle", x: 35, y: 32, label: "Dispense Handle", description: "Pull down to dispense mix" },
      { id: "dispense-handle-2", x: 65, y: 32, label: "Dispense Handle", description: "Pull down to dispense mix" },
    ],
    instructions: [
      "Place drain buckets under both dispensing spouts",
      "Pull down dispense handles to release mix",
      "Allow all product to drain completely into buckets",
      "Remove buckets when draining is complete"
    ]
  },
  {
    id: 2,
    title: "Rinse with Water",
    description: "Clean the machine with warm water",
    icon: <Droplets className="w-6 h-6" />,
    image: "/taylor-c712-real.jpg",
    hotspots: [
      { id: "water-temp", x: 50, y: 18, label: "Temperature", description: "Use warm water (100-110°F) for best results" },
      { id: "rinse-spout", x: 50, y: 32, label: "Rinse Spout", description: "Run water through to flush system" },
      { id: "drip-tray", x: 50, y: 58, label: "Drip Tray", description: "Remove and clean thoroughly" },
    ],
    instructions: [
      "Fill hopper with warm water (100-110°F)",
      "Add approved sanitizer per manufacturer specs",
      "Run cleaning cycle for 2-3 minutes",
      "Drain completely and rinse until water runs clear"
    ]
  },
  {
    id: 3,
    title: "Power Off",
    description: "Safely shut down the machine",
    icon: <Power className="w-6 h-6" />,
    image: "/taylor-c712-real.jpg",
    hotspots: [
      { id: "power-switch", x: 85, y: 25, label: "Power Switch", description: "Flip to OFF position on side panel" },
      { id: "faceplate", x: 50, y: 30, label: "Faceplate", description: "Unscrew for deep cleaning access if needed" },
      { id: "control-panel", x: 50, y: 18, label: "Control Panel", description: "Verify machine is powered down" },
    ],
    instructions: [
      "Flip the power switch to OFF position",
      "Wait 5 minutes for components to settle",
      "Unscrew faceplate if performing deep clean",
      "Unplug from wall outlet (optional for extended shutdown)"
    ]
  }
];

export default function ICMLearning() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const step = tutorialSteps[currentStep];
  const progress = ((completedSteps.size) / tutorialSteps.length) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, step.id]));
      setCurrentStep((prev) => prev + 1);
      setActiveHotspot(null);
      if (currentStep === 1) {
        setIsTimerRunning(true);
      }
    } else {
      setCompletedSteps((prev) => new Set([...prev, step.id]));
      setShowCompletion(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setActiveHotspot(null);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setActiveHotspot(null);
    setCountdown(300);
    setIsTimerRunning(false);
    setShowCompletion(false);
  };

  if (showCompletion) {
    return (
      <Card className="border-slate-200 shadow-lg bg-white">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20"></div>
            <CheckCircle className="w-20 h-20 text-green-500 relative z-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mt-6">Tutorial Complete!</h2>
          <p className="text-slate-600 mt-2 text-center max-w-md">
            You&apos;ve successfully learned how to properly shut down the Taylor C712 Italian Ice Machine.
          </p>
          <Button onClick={handleReset} className="mt-8 bg-blue-600 hover:bg-blue-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Tutorial
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">ICM Learning</CardTitle>
                <p className="text-sm text-slate-500">Turning Off the Machine - Taylor C712</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Step {currentStep + 1} of {tutorialSteps.length}</span>
              <Progress value={progress} className="w-32" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tutorial Area */}
      <Card className="border-slate-200 shadow-md bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: Machine Image with Hotspots */}
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 min-h-[450px] flex items-center justify-center p-6">
              <div className="relative w-full max-w-sm">
                {/* Step-specific Machine Image */}
                <img 
                  src={step.image}
                  alt={`Taylor C712 - ${step.title}`}
                  className="w-full h-auto rounded-xl shadow-2xl bg-white"
                />
                
                {/* Animated Hotspots */}
                {step.hotspots.map((hotspot, index) => (
                  <button
                    key={hotspot.id}
                    onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                  >
                    {/* Pulsing Ring Animation */}
                    <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-40"></span>
                    <span className="absolute inset-0 rounded-full bg-blue-500 animate-pulse opacity-30"></span>
                    
                    {/* Hotspot Button */}
                    <span className={`relative flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 shadow-lg ${
                      activeHotspot === hotspot.id 
                        ? "bg-blue-600 border-blue-600 scale-125" 
                        : "bg-white border-blue-500 hover:scale-110"
                    }`}>
                      <span className={`text-lg font-bold ${activeHotspot === hotspot.id ? "text-white" : "text-blue-600"}`}>
                        {index + 1}
                      </span>
                    </span>
                    
                    {/* Label */}
                    <span className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all ${
                      activeHotspot === hotspot.id 
                        ? "bg-blue-600 text-white opacity-100 scale-100" 
                        : "bg-white text-slate-700 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                    }`}>
                      {hotspot.label}
                    </span>
                  </button>
                ))}

                {/* Animated Arrow pointing to active area */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M19 12l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right: Instructions */}
            <div className="p-6 lg:p-8 flex flex-col bg-white">
              {/* Step Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                  <p className="text-slate-500">{step.description}</p>
                </div>
              </div>

              {/* Timer for Step 3 */}
              {currentStep === 2 && (
                <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <Timer className="w-8 h-8 text-amber-600 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-amber-800 text-lg">Power Down Wait Timer</p>
                      <p className="text-4xl font-mono font-bold text-amber-700 tabular-nums">
                        {formatTime(countdown)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700 mt-3">
                    Wait 5 minutes after powering off before unplugging or cleaning internal components. 
                    This allows the refrigeration system to equalize pressure.
                  </p>
                </div>
              )}

              {/* Instructions List */}
              <div className="flex-1 space-y-3">
                {step.instructions.map((instruction, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-1">{instruction}</p>
                  </div>
                ))}
              </div>

              {/* Hotspot Detail Panel */}
              {activeHotspot && (
                <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-blue-900 text-lg">
                        {step.hotspots.find(h => h.id === activeHotspot)?.label}
                      </p>
                      <p className="text-blue-700 mt-1">
                        {step.hotspots.find(h => h.id === activeHotspot)?.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-6"
                  size="lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </Button>

                {/* Step Indicators */}
                <div className="flex items-center gap-3">
                  {tutorialSteps.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStep(idx)}
                      className={`h-3 rounded-full transition-all duration-300 ${
                        idx === currentStep 
                          ? "bg-blue-600 w-8" 
                          : completedSteps.has(s.id)
                          ? "bg-green-500 w-3"
                          : "bg-slate-300 w-3 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6"
                  size="lg"
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      Complete
                      <CheckCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
