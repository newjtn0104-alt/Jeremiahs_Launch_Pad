"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Edit2, Check } from "lucide-react";

export default function SweetSaying() {
  const [saying, setSaying] = useState(
    "The only way to do great work is to love what you do."
  );
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card className="max-w-5xl mx-auto relative overflow-hidden">
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-500 to-green-500" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-500/20">
            <Sparkles className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">Daily Inspiration</h2>
            <p className="text-sm text-white/50">Words to guide your day</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          {isEditing ? (
            <><Check className="w-4 h-4 mr-2" /> Save</>
          ) : (
            <><Edit2 className="w-4 h-4 mr-2" /> Edit</>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={saying}
            onChange={(e) => setSaying(e.target.value)}
            className="text-lg bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[100px]"
            rows={3}
          />
        ) : (
          <div className="relative py-8 px-4">
            <span className="absolute top-2 left-2 text-6xl text-white/10 font-serif">"</span>
            <p className="text-2xl md:text-3xl font-light italic leading-relaxed text-center text-white/90 relative z-10">
              {saying}
            </p>
            <span className="absolute bottom-2 right-2 text-6xl text-white/10 font-serif rotate-180">"</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
