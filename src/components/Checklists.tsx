"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Calendar, 
  Sunrise, 
  Sunset, 
  ClipboardCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink
} from "lucide-react";

interface ChecklistItem {
  id: string;
  name: string;
  filename: string;
  category: string;
  icon: React.ReactNode;
  description?: string;
}

const checklists: ChecklistItem[] = [
  // Daily Sidework
  { 
    id: "monday", 
    name: "Monday Sidework", 
    filename: "Monday_sidework.pdf",
    category: "Daily Sidework",
    icon: <Calendar className="w-5 h-5" />,
    description: "Monday cleaning and prep tasks"
  },
  { 
    id: "tuesday", 
    name: "Tuesday Sidework", 
    filename: "Tuesday_sidework.pdf",
    category: "Daily Sidework",
    icon: <Calendar className="w-5 h-5" />,
    description: "Tuesday cleaning and prep tasks"
  },
  { 
    id: "wednesday", 
    name: "Wednesday Sidework", 
    filename: "Wednesday_sidework.pdf",
    category: "Daily Sidework",
    icon: <Calendar className="w-5 h-5" />,
    description: "Wednesday cleaning and prep tasks"
  },
  { 
    id: "thursday", 
    name: "Thursday Sidework", 
    filename: "Thursday_sidework.pdf",
    category: "Daily Sidework",
    icon: <Calendar className="w-5 h-5" />,
    description: "Thursday cleaning and prep tasks"
  },
  { 
    id: "friday", 
    name: "Friday Sidework", 
    filename: "Friday_sidework.pdf",
    category: "Daily Sidework",
    icon: <Calendar className="w-5 h-5" />,
    description: "Friday cleaning and prep tasks"
  },
  { 
    id: "saturday", 
    name: "Saturday Sidework", 
    filename: "Saturday_Sidework.pdf",
    category: "Daily Sidework",
    icon: <Calendar className="w-5 h-5" />,
    description: "Saturday cleaning and prep tasks"
  },
  { 
    id: "sunday", 
    name: "Sunday Sidework", 
    filename: "Sunday_sidework.pdf",
    category: "Daily Sidework",
    icon: <Calendar className="w-5 h-5" />,
    description: "Sunday cleaning and prep tasks"
  },
  
  // Operational Checklists
  { 
    id: "opening", 
    name: "Opening Checklist", 
    filename: "Opening_Checklist.pdf",
    category: "Operational",
    icon: <Sunrise className="w-5 h-5" />,
    description: "Daily opening procedures and tasks"
  },
  { 
    id: "closing", 
    name: "Closing Checklist", 
    filename: "Closing_Checklist.pdf",
    category: "Operational",
    icon: <Sunset className="w-5 h-5" />,
    description: "Daily closing procedures and tasks"
  },
  { 
    id: "gx360", 
    name: "GX360", 
    filename: "GX360.pdf",
    category: "Operational",
    icon: <ClipboardCheck className="w-5 h-5" />,
    description: "GX360 quality control checklist"
  },
  { 
    id: "pqcl", 
    name: "PQCL", 
    filename: "PQCL.pdf",
    category: "Operational",
    icon: <Sparkles className="w-5 h-5" />,
    description: "Product Quality Control Log"
  },
  { 
    id: "sanitation", 
    name: "Sanitation Log", 
    filename: "Sanitation_log.pdf",
    category: "Operational",
    icon: <Sparkles className="w-5 h-5" />,
    description: "Daily sanitation tracking log"
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  "Daily Sidework": <Calendar className="w-6 h-6" />,
  "Operational": <ClipboardCheck className="w-6 h-6" />,
};

export default function Checklists() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Daily Sidework", "Operational"]));
  const [downloading, setDownloading] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleDownload = (checklist: ChecklistItem) => {
    setDownloading(checklist.id);
    // In production, this would link to the actual PDF
    // For now, we'll create a placeholder message
    setTimeout(() => setDownloading(null), 1000);
  };

  const categories = Array.from(new Set(checklists.map(c => c.category)));

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Operations Checklists</CardTitle>
              <p className="text-sm text-slate-500">Daily sidework and operational checklists</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {categories.map(category => {
        const categoryChecklists = checklists.filter(c => c.category === category);
        const isExpanded = expandedCategories.has(category);
        
        return (
          <Card key={category} className="border-slate-200 shadow-md bg-white overflow-hidden">
            <CardHeader 
              className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    {categoryIcons[category]}
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    {category}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {categoryChecklists.length} checklists
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {categoryChecklists.map(checklist => (
                    <div 
                      key={checklist.id} 
                      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          {checklist.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{checklist.name}</h3>
                          <p className="text-sm text-slate-500">{checklist.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(checklist)}
                          disabled={downloading === checklist.id}
                          className="flex items-center gap-2"
                        >
                          {downloading === checklist.id ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
