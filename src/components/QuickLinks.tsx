"use client";

import { useState, useEffect, useCallback } from "react";

interface WhatsUpFile {
  name: string;
  path: string;
  date: string;
}

export default function QuickLinks() {
  const [latestFile, setLatestFile] = useState<WhatsUpFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchLatestWhatsUp();
  }, []);

  const fetchLatestWhatsUp = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/files/whatsup");
      const data = await res.json();
      setLatestFile(data.latestFile);
    } catch (error) {
      console.error("Error fetching WhatsUp file:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPreview = () => {
    if (latestFile) {
      setShowPreview(true);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await uploadFile(files[0]);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchLatestWhatsUp();
        alert(`✅ Uploaded: ${file.name}`);
      } else {
        alert("❌ Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Upload error");
    } finally {
      setUploading(false);
    }
  };

  const isPdf = latestFile?.name.toLowerCase().endsWith(".pdf");
  const isImage = latestFile && (latestFile.name.toLowerCase().endsWith(".png") || 
                                  latestFile.name.toLowerCase().endsWith(".jpg") ||
                                  latestFile.name.toLowerCase().endsWith(".jpeg"));

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-3xl">🔗</span>
          Quick Links
        </h2>

        <div className="space-y-3">
          {/* WhatsUp Weekly */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed transition-all ${
              dragActive
                ? "border-blue-400 bg-blue-500/20"
                : "border-blue-500/30 bg-blue-500/10"
            }`}
          >
            <button
              onClick={openPreview}
              disabled={!latestFile || loading}
              className={`w-full text-left p-4 transition-all ${
                latestFile ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold flex items-center gap-2">
                    <span className="text-xl">📰</span>
                    WhatsUp Weekly
                    {latestFile && (
                      <span className="text-xs bg-blue-500/30 px-2 py-1 rounded-full">
                        Click to preview
                      </span>
                    )}
                  </p>
                  {latestFile ? (
                    <p className="text-sm text-blue-200 mt-1">
                      {latestFile.name}
                      <span className="text-xs ml-2 opacity-70">
                        ({new Date(latestFile.date).toLocaleDateString()})
                      </span>
                    </p>
                  ) : loading ? (
                    <p className="text-sm text-blue-200 mt-1">Loading...</p>
                  ) : (
                    <p className="text-sm text-blue-200 mt-1">No file found</p>
                  )}
                </div>
                <span className="text-2xl">👁️</span>
              </div>
            </button>

            {/* Upload overlay */}
            <div className="px-4 pb-4">
              <label className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-colors text-sm text-blue-200">
                <span>📤</span>
                {uploading ? "Uploading..." : "Drop file here or click to upload"}
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Sysco BBJRMH */}
          <a
            href="https://shop.Sysco.com/app/lists/BBJRMH"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-white font-bold flex items-center gap-2">
                <span className="text-xl">🛒</span>
                Sysco BBJRMH List
              </p>
              <span className="text-2xl">→</span>
            </div>
          </a>

          {/* Revel Dashboard */}
          <a
            href="https://jeremiahsice.revelup.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-white font-bold flex items-center gap-2">
                <span className="text-xl">📊</span>
                Revel Dashboard
              </p>
              <span className="text-2xl">→</span>
            </div>
          </a>

          {/* 7shifts */}
          <a
            href="https://app.7shifts.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-white font-bold flex items-center gap-2">
                <span className="text-xl">📅</span>
                7shifts Schedule
              </p>
              <span className="text-2xl">→</span>
            </div>
          </a>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && latestFile && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div 
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div>
                <h3 className="text-xl font-bold text-white">{latestFile.name}</h3>
                <p className="text-sm text-blue-200">
                  {new Date(latestFile.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/files/serve?file=${encodeURIComponent(latestFile.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={closePreview}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 min-h-[60vh]">
              {isPdf ? (
                <iframe
                  src={`/api/files/serve?file=${encodeURIComponent(latestFile.name)}`}
                  className="w-full h-full min-h-[60vh] rounded-lg"
                  title={latestFile.name}
                />
              ) : isImage ? (
                <img
                  src={`/api/files/serve?file=${encodeURIComponent(latestFile.name)}`}
                  alt={latestFile.name}
                  className="max-w-full h-auto rounded-lg mx-auto"
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-white">
                  <p>Preview not available for this file type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
