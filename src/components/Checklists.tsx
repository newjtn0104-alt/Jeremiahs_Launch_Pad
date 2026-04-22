"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, RefreshCw, Calendar, ChevronDown, ChevronUp, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChecklistItem {
  label: string;
  value: string;
  requiresPhoto: boolean;
  requiresValue: boolean;
  photo?: string | null;
}

interface Checklist {
  id: string;
  employeeName: string;
  location: string;
  date: string;
  items: Record<string, ChecklistItem>;
  submittedAt: string;
}

export default function Checklists() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchChecklists = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("from", dateFrom);
      if (dateTo) params.append("to", dateTo);

      const response = await fetch(`/api/checklist?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setChecklists(data.checklists);
      } else {
        setError(data.error || "Failed to fetch checklists");
      }
    } catch (err) {
      setError("Failed to fetch checklists");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const toggleChecklist = (checklistId: string) => {
    setExpandedChecklists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(checklistId)) {
        newSet.delete(checklistId);
      } else {
        newSet.add(checklistId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Count photos in a checklist
  const getPhotoCount = (items: Record<string, ChecklistItem>) => {
    return Object.values(items).filter((item) => item.photo).length;
  };

  return (
    <div className="space-y-6">
      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto}
              alt="Checklist photo"
              className="max-w-full max-h-[90vh] rounded-lg"
            />
            <Button
              variant="outline"
              className="absolute top-2 right-2 bg-white"
              onClick={() => setSelectedPhoto(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Header Card */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100">
                <ClipboardCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Daily Checklists</CardTitle>
                <p className="text-sm text-slate-500">{checklists.length} submissions found</p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchChecklists} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Date Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                From Date
              </label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                To Date
              </label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchChecklists} disabled={loading} className="w-full sm:w-auto">
                Filter
              </Button>
            </div>
          </div>

          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-4">{error}</div>}
        </CardContent>
      </Card>

      {/* Checklists List */}
      {checklists.length === 0 && !loading && !error && (
        <Card className="border-slate-200 shadow-md bg-white">
          <CardContent className="p-8 text-center">
            <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No checklists found.</p>
          </CardContent>
        </Card>
      )}

      {checklists.map((checklist) => {
        const isExpanded = expandedChecklists.has(checklist.id);
        const itemCount = Object.keys(checklist.items).length;
        const photoCount = getPhotoCount(checklist.items);

        return (
          <Card key={checklist.id} className="border-slate-200 shadow-md bg-white overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-slate-50" onClick={() => toggleChecklist(checklist.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ClipboardCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{checklist.employeeName}</h3>
                    <p className="text-sm text-slate-500">
                      {checklist.location} • {formatDate(checklist.date)} • {itemCount} items
                      {photoCount > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                          <Camera className="w-3 h-3" />
                          {photoCount} photos
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      Submitted at {formatTime(checklist.submittedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-slate-200 bg-slate-50">
                <div className="p-4">
                  <h4 className="font-medium text-slate-700 mb-3">Checklist Items</h4>
                  <div className="space-y-3">
                    {Object.entries(checklist.items).map(([itemId, item]) => (
                      <div key={itemId} className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-700">{item.label}</p>
                          {item.requiresValue && item.value && (
                            <span className="text-lg font-semibold text-slate-900">{item.value}</span>
                          )}
                        </div>
                        {item.photo && (
                          <div className="mt-2">
                            <img
                              src={item.photo}
                              alt={`${item.label} photo`}
                              className="max-w-xs max-h-32 rounded-lg border border-slate-200 cursor-pointer hover:opacity-80"
                              onClick={() => setSelectedPhoto(item.photo!)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
// Checklist view updated Wed Apr 22 00:38:39 EDT 2026
