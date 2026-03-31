"use client";

import { useState } from "react";

export default function FroggyFocuses() {
  const [focuses, setFocuses] = useState([
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

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">🐸</span>
          Froggy Focuses
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-200 hover:text-white transition-colors"
        >
          {isEditing ? "✓ Done" : "✏️ Edit"}
        </button>
      </div>

      <div className="space-y-3">
        {focuses.map((focus) => (
          <div
            key={focus.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              focus.completed
                ? "bg-green-500/20 border border-green-500/30"
                : "bg-white/10 border border-white/10"
            }`}
          >
            <button
              onClick={() => toggleComplete(focus.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                focus.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-white/40 hover:border-white"
              }`}
            >
              {focus.completed && "✓"}
            </button>
            <span
              className={`flex-1 ${
                focus.completed
                  ? "text-white line-through opacity-60"
                  : "text-white"
              }`}
            >
              {focus.text}
            </span>
            {isEditing && (
              <button
                onClick={() => removeFocus(focus.id)}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newFocus}
            onChange={(e) => setNewFocus(e.target.value)}
            placeholder="Add new focus..."
            className="flex-1 p-2 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onKeyPress={(e) => e.key === "Enter" && addFocus()}
          />
          <button
            onClick={addFocus}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
