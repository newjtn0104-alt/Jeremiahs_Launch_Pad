"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Upload, FileText, X } from "lucide-react";

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

  const links = [
    { name: "Sysco BBJRMH", url: "https://shop.sysco.com/app/lists/BBJRMH", icon: "🛒" },
    { name: "Revel Dashboard", url: "https://jeremiahsice.revelup.com", icon: "📊" },
    { name: "7shifts", url: "https://app.7shifts.com", icon: "📅" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-2xl">{link.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{link.name}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {/* WhatsUp Weekly */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            WhatsUp Weekly
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {latestFile ? (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">{latestFile.name}</p>
                <p className="text-sm text-slate-500">{latestFile.date}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                  View
                </Button>
                <a href={`/api/files/serve?path=${encodeURIComponent(latestFile.path)}`} download>
                  <Button size="sm">Download</Button>
                </a>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">No WhatsUp Weekly file uploaded yet.</p>
          )}

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 hover:border-slate-400"
            }`}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-slate-600 mb-2">
              {uploading ? "Uploading..." : "Drag & drop a file here, or click to browse"}
            </p>
            <Input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && latestFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{latestFile.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {latestFile.name.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`/api/files/serve?path=${encodeURIComponent(latestFile.path)}`}
                  className="w-full h-[70vh]"
                />
              ) : (
                <img
                  src={`/api/files/serve?path=${encodeURIComponent(latestFile.path)}`}
                  alt={latestFile.name}
                  className="max-w-full h-auto"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
