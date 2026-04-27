"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from "lucide-react";
import { parse } from "csv-parse/sync";

interface BulkImportEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedEmployee {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  store: string;
  role: string;
  position: string;
  wage: number;
  status: "active" | "inactive";
  row: number;
  errors: string[];
}

const ROLE_MAPPING: Record<string, string> = {
  "employee": "employee",
  "assistant manager": "assistant_manager",
  "manager": "manager",
  "admin": "admin",
};

const POSITION_MAPPING: Record<string, string> = {
  "servers": "Server",
  "server": "Server",
  "cashier": "Cashier",
  "cashiers": "Cashier",
  "shift leader": "Shift Leader",
  "shift leaders": "Shift Leader",
  "assistant manager": "Assistant Manager",
  "store manager": "Store Manager",
  "production": "Production",
  "prep": "Prep",
  "vending": "Server",
  "training": "Server",
  "opening server": "Server",
};

const STORE_MAPPING: Record<string, string> = {
  "jii 1016 pembroke pines": "Pembroke Pines",
  "jii 1068 coral springs": "Coral Springs",
  "pembroke pines": "Pembroke Pines",
  "coral springs": "Coral Springs",
};

export default function BulkImportEmployeesModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkImportEmployeesModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedEmployee[]>([]);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "results">("upload");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = async (csvFile: File) => {
    try {
      const text = await csvFile.text();
      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const employees: ParsedEmployee[] = records.map((record: any, index: number) => {
        const errors: string[] = [];
        
        // Map location to store
        const location = (record["Location"] || "").toLowerCase();
        const store = STORE_MAPPING[location] || "Pembroke Pines";
        
        // Map role/position
        const roleValue = (record["User type"] || record["Role"] || "").toLowerCase();
        const role = ROLE_MAPPING[roleValue] || "employee";
        
        const positionValue = (record["Role"] || "").toLowerCase();
        const position = POSITION_MAPPING[positionValue] || "Server";
        
        // Parse wage
        let wage = 11.00;
        const wageStr = record["Wage"] || "";
        if (wageStr) {
          const parsedWage = parseFloat(wageStr);
          if (!isNaN(parsedWage)) {
            wage = parsedWage;
          }
        }
        
        // Determine status
        const statusValue = (record["User status"] || "").toLowerCase();
        const status = statusValue === "inactive" ? "inactive" : "active";
        
        // Validate required fields
        const firstName = record["First name"] || "";
        const lastName = record["Last name"] || "";
        const email = record["Email"] || "";
        
        if (!firstName) errors.push("Missing first name");
        if (!lastName) errors.push("Missing last name");
        if (!email) errors.push("Missing email");
        if (email && !email.includes("@")) errors.push("Invalid email format");
        
        return {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: record["Mobile phone"] || "",
          store,
          role,
          position,
          wage,
          status,
          row: index + 2, // +2 because header is row 1
          errors,
        };
      });

      setParsedData(employees);
      setStep("preview");
    } catch (error) {
      console.error("Error parsing CSV:", error);
      alert("Failed to parse CSV file. Please check the format.");
    }
  };

  const handleImport = async () => {
    setLoading(true);
    const validEmployees = parsedData.filter(emp => emp.errors.length === 0);
    
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const employee of validEmployees) {
      try {
        const res = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            store: employee.store,
            role: employee.role,
            position: employee.position,
            wage: employee.wage,
            password_hash: "temp123", // Default password
          }),
        });

        const data = await res.json();

        if (data.success) {
          successCount++;
        } else {
          failedCount++;
          errors.push(`Row ${employee.row}: ${data.error || "Unknown error"}`);
        }
      } catch (error) {
        failedCount++;
        errors.push(`Row ${employee.row}: Failed to import`);
      }
    }

    setImportResults({ success: successCount, failed: failedCount, errors });
    setStep("results");
    setLoading(false);
    
    if (successCount > 0) {
      onSuccess();
    }
  };

  const downloadTemplate = () => {
    const template = `First name,Last name,Email,Mobile phone,Location,Role,Wage,User status
John,Doe,john@example.com,555-1234,JII 1016 Pembroke Pines,Servers,11.00,Active
Jane,Smith,jane@example.com,555-5678,JII 1068 Coral Springs,Cashier,12.00,Active`;
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setImportResults(null);
    setStep("upload");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const validEmployees = parsedData.filter(emp => emp.errors.length === 0);
  const invalidEmployees = parsedData.filter(emp => emp.errors.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Bulk Import Employees</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "upload" && (
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">CSV Format</h3>
              <p className="text-sm text-blue-700 mb-3">
                Your CSV should include these columns: First name, Last name, Email, Mobile phone, Location, Role, Wage, User status
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Template
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-10 h-10 text-gray-400" />
                  <span className="text-gray-600">Click to upload CSV file</span>
                  <span className="text-sm text-gray-400">or drag and drop</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Preview ({parsedData.length} employees found)</h3>
              <div className="flex gap-2 text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {validEmployees.length} valid
                </span>
                {invalidEmployees.length > 0 && (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {invalidEmployees.length} invalid
                  </span>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Store</th>
                    <th className="px-3 py-2 text-left">Position</th>
                    <th className="px-3 py-2 text-left">Wage</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((emp, idx) => (
                    <tr key={idx} className={emp.errors.length > 0 ? "bg-red-50" : ""}>
                      <td className="px-3 py-2">
                        {emp.first_name} {emp.last_name}
                        {emp.errors.length > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {emp.errors.join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">{emp.email}</td>
                      <td className="px-3 py-2">{emp.store}</td>
                      <td className="px-3 py-2">{emp.position}</td>
                      <td className="px-3 py-2">${emp.wage.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          emp.status === "active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={reset} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={loading || validEmployees.length === 0}
                className="flex-1"
              >
                {loading 
                  ? "Importing..." 
                  : `Import ${validEmployees.length} Employees`
                }
              </Button>
            </div>
          </div>
        )}

        {step === "results" && importResults && (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{importResults.success}</div>
                  <div className="text-sm text-gray-600">Imported</div>
                </div>
                {importResults.failed > 0 && (
                  <>
                    <div className="w-px h-12 bg-gray-300" />
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{importResults.failed}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-red-50">
                <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {importResults.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Close
              </Button>
              {importResults.failed > 0 && (
                <Button onClick={reset} className="flex-1">
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
