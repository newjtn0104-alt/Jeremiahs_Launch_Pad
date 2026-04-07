"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Check, Plus, X } from "lucide-react";

interface Focus {
  id: number;
  text: string;
  completed: boolean;
}

export default function FroggyFocuses() {
  const [focuses, setFocuses] = useState<Focus[]>([
    { id: 1, text: "Greet every customer with a smile", completed: false },
    { id: 2, text: "Upsell Italian Ice samples", completed: false },
    { id: 3, text: "Keep counter clean and organized", completed: false },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [newFocus, setNewFocus] = useState("");

  const toggleComplete = (id: number) => {
    setFocuses(
      focuses.map((f) => (f.id === id ? { ...f, completed: !f.completed } : f))
    );
  };

  const addFocus = () => {
    if (newFocus.trim()) {
      setFocuses([...focuses, { id: Date.now(), text: newFocus, completed: false }]);
      setNewFocus("");
    }
  };

  const removeFocus = (id: number) => {
    setFocuses(focuses.filter((f) => f.id !== id));
  };

  const completedCount = focuses.filter(f => f.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {completedCount} of {focuses.length} completed
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <><Check className="w-4 h-4 mr-2" /> Done</>
          ) : (
            <><Edit2 className="w-4 h-4 mr-2" /> Edit</>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        {focuses.map((focus) => (
          <div
            key={focus.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              focus.completed
                ? "bg-green-50 border-green-200"
                : "bg-white border-slate-200"
            }`}
          >
            <Checkbox
              checked={focus.completed}
              onCheckedChange={() => toggleComplete(focus.id)}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <span
              className={`flex-1 ${
                focus.completed
                  ? "text-slate-500 line-through"
                  : "text-slate-900"
              }`}
            >
              {focus.text}
            </span>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFocus(focus.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="flex gap-2 mt-4">
          <Input
            type="text"
            value={newFocus}
            onChange={(e) => setNewFocus(e.target.value)}
            placeholder="Add new focus..."
            className="flex-1"
            onKeyPress={(e) => e.key === "Enter" && addFocus()}
          />
          <Button onClick={addFocus}>
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </div>
      )}
    </div>
  );
}
