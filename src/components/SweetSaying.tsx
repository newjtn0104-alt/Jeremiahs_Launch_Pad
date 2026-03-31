"use client";

import { useState } from "react";

export default function SweetSaying() {
  const [saying, setSaying] = useState(
    "The only way to do great work is to love what you do."
  );
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">💭</span>
          Today&apos;s Sweet Saying
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-200 hover:text-white transition-colors text-lg"
        >
          {isEditing ? "✓ Save" : "✏️ Edit"}
        </button>
      </div>

      {isEditing ? (
        <textarea
          value={saying}
          onChange={(e) => setSaying(e.target.value)}
          className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          rows={3}
        />
      ) : (
        <p className="text-2xl text-white font-medium italic leading-relaxed text-center py-4">
          &ldquo;{saying}&rdquo;
        </p>
      )}
    </div>
  );
}
