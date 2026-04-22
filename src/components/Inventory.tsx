"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, RefreshCw, Calendar, ChevronDown, ChevronUp, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Submission {
  id: string;
  employeeName: string;
  location: string;
  date: string;
  items: Record<string, string>;
  notes?: string;
  submittedAt: string;
}

export default function Inventory() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("from", dateFrom);
      if (dateTo) params.append("to", dateTo);

      const response = await fetch(`/api/inventory?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setSubmissions(data.submissions);
      } else {
        setError(data.error || "Failed to fetch submissions");
      }
    } catch (err) {
      setError("Failed to fetch submissions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const toggleSubmission = (submissionId: string) => {
    setExpandedSubmissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
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

  // Export single submission to CSV
  const exportSubmissionToCSV = (submission: Submission, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const headers = ["Item Name", "Count"];
    const rows = Object.entries(submission.items).map(([itemName, count]) => [
      `"${itemName}"`,
      count,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${submission.employeeName}_${submission.date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Export all submissions to CSV
  const exportAllToCSV = () => {
    const headers = ["Date", "Employee", "Location", "Item Name", "Count", "Notes"];
    const rows: string[][] = [];

    submissions.forEach((sub) => {
      Object.entries(sub.items).forEach(([itemName, count]) => {
        rows.push([sub.date, sub.employeeName, sub.location, itemName, count, sub.notes || ""]);
      });
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_all_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Inventory Submissions</CardTitle>
                <p className="text-sm text-slate-500">{submissions.length} submissions found</p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchSubmissions} disabled={loading}>
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
              <Button onClick={fetchSubmissions} disabled={loading} className="w-full sm:w-auto">
                Filter
              </Button>
            </div>
          </div>

          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-4">{error}</div>}

          {/* Export All Button */}
          {submissions.length > 0 && (
            <Button variant="outline" onClick={exportAllToCSV} className="mb-4 w-full">
              <Download className="w-4 h-4 mr-2" />
              Export All to CSV
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Submissions List */}
      {submissions.length === 0 && !loading && !error && (
        <Card className="border-slate-200 shadow-md bg-white">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No submissions found.</p>
          </CardContent>
        </Card>
      )}

      {submissions.map((submission) => {
        const isExpanded = expandedSubmissions.has(submission.id);
        const itemCount = Object.keys(submission.items).length;
        const hasNotes = submission.notes && submission.notes.trim().length > 0;

        return (
          <Card key={submission.id} className="border-slate-200 shadow-md bg-white overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-slate-50" onClick={() => toggleSubmission(submission.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{submission.employeeName}</h3>
                    <p className="text-sm text-slate-500">
                      {submission.location} • {formatDate(submission.date)} • {itemCount} items
                      {hasNotes && (
                        <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                          <FileText className="w-3 h-3" />
                          Has notes
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => exportSubmissionToCSV(submission, e)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
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
                  {/* Notes Section */}
                  {hasNotes && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Notes
                      </h4>
                      <p className="text-blue-800 text-sm whitespace-pre-wrap">{submission.notes}</p>
                    </div>
                  )}
                  
                  <h4 className="font-medium text-slate-700 mb-3">Inventory Items</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(submission.items).map(([itemName, count]) => (
                      <div key={itemName} className="bg-white p-3 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 truncate">{itemName}</p>
                        <p className="text-lg font-semibold text-slate-900">{count}</p>
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
