"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Edit2, Check, RefreshCw } from "lucide-react";
import quotes from "@/data/quotes.json";

// Get daily quote based on day of year
const getDailyQuote = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return quotes[dayOfYear % quotes.length];
};

export default function SweetSaying() {
  const [saying, setSaying] = useState(getDailyQuote());
  const [isEditing, setIsEditing] = useState(false);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  // Get random quote (no repeats until all shown)
  const getRandomQuote = () => {
    if (usedIndices.length === quotes.length) {
      setUsedIndices([]); // Reset when all quotes used
    }
    
    const availableIndices = quotes
      .map((_, i) => i)
      .filter(i => !usedIndices.includes(i));
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedIndices([...usedIndices, randomIndex]);
    setSaying(quotes[randomIndex]);
  };

  return (
    <Card className="max-w-5xl mx-auto border-slate-200 shadow-md bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Todays Sweet Saying:</h2>
            <p className="text-sm text-slate-500">Words to guide your day</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={getRandomQuote}
            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> New Quote
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-slate-500 hover:text-slate-700"
          >
            {isEditing ? (
              <><Check className="w-4 h-4 mr-2" /> Save</>
            ) : (
              <><Edit2 className="w-4 h-4 mr-2" /> Edit</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={saying}
            onChange={(e) => setSaying(e.target.value)}
            className="text-lg border-slate-300"
            rows={3}
          />
        ) : (
          <div className="relative py-8 px-4">
            <span className="absolute top-2 left-2 text-6xl text-slate-200 font-serif">"</span>
            <p className="text-2xl md:text-3xl font-light italic leading-relaxed text-center text-slate-700 relative z-10">
              {saying}
            </p>
            <span className="absolute bottom-2 right-2 text-6xl text-slate-200 font-serif rotate-180">"</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
