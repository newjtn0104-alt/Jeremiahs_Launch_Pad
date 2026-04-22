"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, ClipboardCheck, Camera } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  value: string;
  photo?: string | null;
  requiresPhoto: boolean;
}

interface FormData {
  name: string;
  location: string;
  date: string;
  items: Record<string, ChecklistItem>;
}

const CHECKLIST_ITEMS = [
  { id: "mango_cooler_temp", label: "Mango Cooler Temp", requiresPhoto: true },
  { id: "lemon_cooler_temp", label: "Lemon Cooler Temp", requiresPhoto: true },
  { id: "ipad_1_battery", label: "iPad 1 Battery", requiresPhoto: true },
  { id: "ipad_2_battery", label: "iPad 2 Battery", requiresPhoto: true },
  { id: "ipad_3_battery", label: "iPad 3 Battery", requiresPhoto: true },
  { id: "ipad_olo_battery", label: "iPad OLO Battery", requiresPhoto: true },
  { id: "customer_ipad_1_battery", label: "Customer iPad 1 Battery", requiresPhoto: true },
  { id: "customer_ipad_2_battery", label: "Customer iPad 2 Battery", requiresPhoto: true },
  { id: "customer_ipad_3_battery", label: "Customer iPad 3 Battery", requiresPhoto: true },
  { id: "money_till", label: "Money Till", requiresPhoto: true },
  { id: "icm_1_timer", label: "ICM 1 Timer", requiresPhoto: true },
  { id: "icm_2_timer", label: "ICM 2 Timer", requiresPhoto: true },
  { id: "blast_temp", label: "Blast Temp", requiresPhoto: true },
  { id: "refrigerator_temp", label: "Refrigerator Temp", requiresPhoto: true },
  { id: "vanilla_mix_case", label: "Vanilla Mix Case", requiresPhoto: false },
  { id: "chocolate_mix_case", label: "Chocolate Mix Case", requiresPhoto: false },
];

// Compress image before storing
const compressImage = (base64String: string, maxWidth = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG with 0.7 quality
      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      resolve(compressed);
    };
    img.onerror = reject;
  });
};

export default function DailyChecklistForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    items: {},
  });
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (itemId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [itemId]: {
          ...prev.items[itemId],
          id: itemId,
          label: CHECKLIST_ITEMS.find(i => i.id === itemId)?.label || itemId,
          value,
          requiresPhoto: CHECKLIST_ITEMS.find(i => i.id === itemId)?.requiresPhoto || false,
        },
      },
    }));
  };

  const handlePhotoCapture = async (itemId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        // Compress the image
        const compressed = await compressImage(reader.result as string);
        
        setFormData((prev) => ({
          ...prev,
          items: {
            ...prev.items,
            [itemId]: {
              ...prev.items[itemId],
              id: itemId,
              label: CHECKLIST_ITEMS.find(i => i.id === itemId)?.label || itemId,
              value: prev.items[itemId]?.value || "",
              requiresPhoto: true,
              photo: compressed,
            },
          },
        }));
      } catch (error) {
        console.error("Error compressing image:", error);
        alert("Error processing photo. Please try again.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare all items
      const allItems: Record<string, any> = {};
      CHECKLIST_ITEMS.forEach((item) => {
        allItems[item.id] = {
          label: item.label,
          value: formData.items[item.id]?.value || "",
          requiresPhoto: item.requiresPhoto,
          photo: item.requiresPhoto ? (formData.items[item.id]?.photo || null) : null,
        };
      });

      const submitData = {
        ...formData,
        items: allItems,
      };

      const response = await fetch("/api/checklist/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json().catch(() => ({ error: "Unknown error" }));

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: "",
            location: "",
            date: new Date().toISOString().split("T")[0],
            items: {},
          });
        }, 3000);
      } else {
        alert("Failed to submit: " + (responseData.error || responseData.details || "Please try again."));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error submitting checklist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-slate-200 shadow-md bg-white">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Checklist Submitted!
          </h3>
          <p className="text-slate-600">
            Thank you for completing the daily checklist.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-md bg-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-100">
            <ClipboardCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Daily Checklist
            </CardTitle>
            <p className="text-sm text-slate-500">
              Complete the daily temperature and battery checks
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <Label htmlFor="name" className="text-slate-700 font-medium">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Your name"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-slate-700 font-medium">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Pembroke Pines or Coral Springs"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="date" className="text-slate-700 font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Checklist Items ({CHECKLIST_ITEMS.length} items)
            </h3>
            <div className="space-y-4">
              {CHECKLIST_ITEMS.map((item) => {
                const itemData = formData.items[item.id];
                const hasPhoto = itemData?.photo;

                return (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <Label
                          htmlFor={item.id}
                          className="text-slate-700 font-medium flex items-center gap-2"
                        >
                          {item.label}
                          {item.requiresPhoto && (
                            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                              Photo Required
                            </span>
                          )}
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          id={item.id}
                          type="text"
                          value={itemData?.value || ""}
                          onChange={(e) => handleItemChange(item.id, e.target.value)}
                          placeholder="Enter value"
                          required
                          className="w-32"
                        />
                        {item.requiresPhoto && (
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              ref={(el) => { fileInputRefs.current[item.id] = el; }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePhotoCapture(item.id, file);
                              }}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant={hasPhoto ? "default" : "outline"}
                              size="sm"
                              onClick={() => fileInputRefs.current[item.id]?.click()}
                              className={hasPhoto ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              <Camera className="w-4 h-4 mr-1" />
                              {hasPhoto ? "Photo Added" : "Add Photo"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {hasPhoto && (
                      <div className="mt-3">
                        <img
                          src={itemData.photo!}
                          alt={`${item.label} photo`}
                          className="max-w-xs max-h-48 rounded-lg border border-slate-200"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-3 text-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Checklist"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
