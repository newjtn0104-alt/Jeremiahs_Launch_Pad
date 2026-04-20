"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, RefreshCw, Calendar, ChevronDown, ChevronUp, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InventoryItem {
  id: string;
  itemName: string;
  count: number;
}

interface Submission {
  submissionId: string;
  submissionTitle?: string;
  submitterName?: string;
  location?: string;
  formId: string;
  respondedAt: string;
  createdAt: string;
  items: InventoryItem[];
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
    setExpandedSubmissions(prev => {
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
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Count zero inventory items in a submission
  const getZeroCountItems = (items: InventoryItem[]) => {
    return items.filter(item => item.count === 0);
  };

  // Export single submission to CSV
  const exportSubmissionToCSV = (submission: Submission) => {
    const headers = ['Item Name', 'Count', 'Status'];
    const rows = submission.items.map(item => [
      `"${item.itemName}"`,
      item.count,
      item.count === 0 ? 'OUT OF STOCK' : 'OK'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${submission.submissionId.slice(0, 8)}-${new Date(submission.respondedAt).toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Export all submissions to CSV
  const exportAllToCSV = () => {
    const headers = ['Submission ID', 'Date', 'Title', 'Item Name', 'Count', 'Status'];
    const rows: string[][] = [];
    
    submissions.forEach(submission => {
      submission.items.forEach(item => {
        rows.push([
          submission.submissionId.slice(0, 8),
          new Date(submission.respondedAt).toISOString().split('T')[0],
          `"${submission.submissionTitle || 'N/A'}"`,
          `"${item.itemName}"`,
          item.count.toString(),
          item.count === 0 ? 'OUT OF STOCK' : 'OK'
        ]);
      });
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-all-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Inventory Submissions</CardTitle>
                <p className="text-sm text-slate-500">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {submissions.length > 0 && (
                <Button 
                  onClick={exportAllToCSV} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export All
                </Button>
              )}
              <Button 
                onClick={fetchSubmissions} 
                variant="outline" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-1 block">From Date</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-1 block">To Date</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <Button onClick={fetchSubmissions} className="bg-green-600 hover:bg-green-700">
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700">
            {error}
          </CardContent>
        </Card>
      )}

      {submissions.length === 0 && !loading && !error && (
        <Card className="border-slate-200 shadow-md bg-white">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 rounded-full bg-slate-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Submissions Yet</h3>
              <p className="text-slate-500">
                Share your Tally form URL with employees. Submissions will appear here automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {submissions.map((submission) => {
        const isExpanded = expandedSubmissions.has(submission.submissionId);
        const zeroItems = getZeroCountItems(submission.items);
        const hasZeroItems = zeroItems.length > 0;
        
        return (
          <Card key={submission.submissionId} className={`border-slate-200 shadow-md bg-white overflow-hidden ${hasZeroItems ? 'border-l-4 border-l-red-500' : ''}`}>
            <CardHeader 
              className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => toggleSubmission(submission.submissionId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${hasZeroItems ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {hasZeroItems ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Package className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-800">
                      {submission.submissionTitle || `Submission ${submission.submissionId.slice(0, 8)}`}
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      {formatDate(submission.respondedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hasZeroItems && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {zeroItems.length} OUT OF STOCK
                    </span>
                  )}
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {submission.items.length} items
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
                  {submission.items.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors ${item.count === 0 ? 'bg-red-50' : ''}`}>
                      <span className={`font-medium ${item.count === 0 ? 'text-red-700' : 'text-slate-700'}`}>
                        {item.itemName}
                        {item.count === 0 && (
                          <span className="ml-2 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">OUT OF STOCK</span>
                        )}
                      </span>
                      <span className={`font-bold px-4 py-1.5 rounded-lg min-w-[60px] text-center ${
                        item.count === 0 
                          ? 'text-white bg-red-600' 
                          : 'text-slate-900 bg-slate-100'
                      }`}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      exportSubmissionToCSV(submission);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export to CSV
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
