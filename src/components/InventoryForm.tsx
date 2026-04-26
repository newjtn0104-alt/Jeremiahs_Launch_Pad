"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, Package } from "lucide-react";

interface FormData {
  name: string;
  location: string;
  date: string;
  items: Record<string, string>;
  notes: string;
}

// Grouped inventory items
const INVENTORY_GROUPS = [
  {
    name: "Lids",
    items: [
      { id: "small_lid", label: "SMALL/Tadpole LID 7oz Dome" },
      { id: "medium_lid", label: "MEDIUM LID DNR640" },
      { id: "large_lid", label: "LARGE LID DNR626" },
      { id: "half_gallon_lid", label: "HALF GALLON LID" },
    ],
  },
  {
    name: "Cups",
    items: [
      { id: "tadpole_cup", label: "Tadpole 5 oz Cup" },
      { id: "small_cups", label: "SMALL CUPS" },
      { id: "medium_cups", label: "MEDIUM CUPS TP22" },
      { id: "large_cup", label: "LARGE CUP TP16D" },
      { id: "translucent_cups", label: "TRANSLUCENT CUPS (Water Cups)" },
      { id: "souffle_cup", label: "SOUFFLE CUP (Pup Cups)" },
      { id: "sample_cups", label: "SAMPLE CUPS" },
    ],
  },
  {
    name: "Containers & Carriers",
    items: [
      { id: "half_gallon_container", label: "HALF GALLON CONTAINER" },
      { id: "quart_container", label: "QUART CONTAINER/LID" },
      { id: "togo_carrier", label: "TOGO CARRIER" },
    ],
  },
  {
    name: "Vanilla & Chocolate Mix",
    items: [
      { id: "vanilla_mix", label: "Vanilla Mix" },
      { id: "chocolate_mix", label: "Chocolate Mix" },
    ],
  },
  {
    name: "Italian Ice Bases",
    items: [
      { id: "mango_base", label: "Ice Italian Base Mango" },
      { id: "blueberry_base", label: "Ice Italian Base Blueberry" },
      { id: "chocolate_base", label: "Ice Italian Base Chocolate" },
      { id: "sea_salt_caramel_base", label: "Ice Italian Base Sea Salt Caramel" },
      { id: "sugar_free_cherry_base", label: "Ice Italian Base Sugar Free Cherry" },
      { id: "sugar_free_mango_base", label: "Ice Italian Base Sugar Free Mango" },
      { id: "black_cherry_base", label: "Ice Italian Base Black Cherry" },
      { id: "orange_smash_base", label: "Ice Italian Base Orange Smash" },
      { id: "strawberry_base", label: "Ice Italian Base Strawberry" },
      { id: "sour_green_apple_base", label: "Ice Italian Base Sour Green Apple" },
      { id: "mint_scoop_frog_base", label: "Ice Italian Base Mint Scoop Frog" },
      { id: "strawberry_lemon_base", label: "Ice Italian Base Strawberry Lemon" },
      { id: "cherry_base", label: "Ice Italian Base Cherry" },
      { id: "pink_cotton_candy_base", label: "Ice Italian Base Pink Cotton Candy" },
      { id: "stabilizer_base", label: "Stabilizer Base Water Ice Mix" },
      { id: "lemon_base", label: "Ice Italian Lemon base" },
    ],
  },
  {
    name: "Toppings & Mix-ins",
    items: [
      { id: "crushed_pineapple", label: "Crushed Pineapple" },
      { id: "pineapple_juice", label: "Pineapple Juice" },
      { id: "peanut_butter", label: "Peanut Butter" },
      { id: "goya_coconut", label: "Goya Coconut" },
      { id: "cookie_butter_crumbs", label: "Cookie Butter Crumbs" },
      { id: "cake_batter", label: "Cake Batter" },
      { id: "shredded_coconut", label: "Shredded Coconut" },
      { id: "sugar", label: "Sugar" },
      { id: "chocolate_chips", label: "Chocolate Chips" },
      { id: "oreo_cookies", label: "Oreo Cookies" },
      { id: "ic_sandwich_wafer", label: "IC Sandwich Wafer" },
      { id: "nerds", label: "Nerds" },
      { id: "rainbow_sprinkles", label: "Rainbow Sprinkles" },
    ],
  },
  {
    name: "Utensils",
    items: [
      { id: "green_spoons", label: "GREEN SPOONS" },
      { id: "sample_spoons", label: "SAMPLE SPOONS" },
      { id: "vinyl_gloves", label: "VINYL GLOVES (Plastic Gloves)" },
    ],
  },
  {
    name: "Paper Goods",
    items: [
      { id: "register_roll", label: "REGISTER ROLL (Receipt Paper)" },
      { id: "thank_you_bag", label: "THANK YOU BAG (To Go Bags)" },
      { id: "paper_towel_roll", label: "PAPER TOWEL ROLL (Brown Napkins)" },
      { id: "toilet_paper", label: "TOILET PAPER" },
      { id: "napkins", label: "NAPKINS" },
      { id: "black_trash_bag", label: "BLACK TRASH BAG" },
      { id: "wypall", label: "WYPALL (Blue Rags)" },
    ],
  },
  {
    name: "Cleaning Supplies",
    items: [
      { id: "icm_lube", label: "ICM Lube" },
      { id: "sanitizer", label: "SANITIZER For Sink" },
      { id: "magic_eraser", label: "MAGIC ERASER" },
      { id: "handsoap", label: "HANDSOAP" },
      { id: "dishwashing_detergent", label: "Dishwashing Detergent" },
      { id: "mop_sink_cleaner", label: "MOP SINK CLEANER" },
      { id: "glass_cleaner", label: "Glass Cleaner" },
      { id: "sheila_shine", label: "SHEILA SHINE (Stainless Steel Cleaner)" },
      { id: "wet_wipes", label: "WET WIPES" },
    ],
  },
  {
    name: "Other",
    items: [
      { id: "water_bottles", label: "Water Bottles" },
    ],
  },
];

// Flatten for submission
const ALL_ITEMS = INVENTORY_GROUPS.flatMap(group => group.items);

export default function InventoryForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    items: {},
    notes: "",
  });

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
        [itemId]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Include ALL items, setting 0 for empty ones
      const allItems: Record<string, string> = {};
      ALL_ITEMS.forEach((item) => {
        allItems[item.id] = formData.items[item.id] || "0";
      });

      const submitData = {
        ...formData,
        items: allItems,
      };

      const response = await fetch("/api/inventory/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: "",
            location: "",
            date: new Date().toISOString().split("T")[0],
            items: {},
            notes: "",
          });
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        alert("Failed to submit: " + (errorData.error || "Please try again."));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error submitting inventory. Please try again.");
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
            Inventory Submitted!
          </h3>
          <p className="text-slate-600">
            Thank you for completing the weekly inventory.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-md bg-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Weekly Inventory
            </CardTitle>
            <p className="text-sm text-slate-500">
              Complete the inventory count for your location
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

          {/* Inventory Items - Grouped */}
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-slate-900">
              Inventory Counts ({ALL_ITEMS.length} items)
            </h3>
            
            {INVENTORY_GROUPS.map((group) => (
              <div key={group.name} className="border-t border-slate-200 pt-6">
                <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {group.name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <Label
                        htmlFor={item.id}
                        className="text-sm text-slate-700 font-medium"
                      >
                        {item.label}
                      </Label>
                      <Input
                        id={item.id}
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.items[item.id] || ""}
                        onChange={(e) => handleItemChange(item.id, e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Notes Section */}
          <div className="pt-4 border-t border-slate-200">
            <Label htmlFor="notes" className="text-slate-700 font-medium text-lg">
              Additional Notes
            </Label>
            <p className="text-sm text-slate-500 mb-2">
              Add any comments, issues, or special instructions
            </p>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter any additional notes here..."
              rows={4}
              className="mt-1"
            />
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
                "Submit Inventory"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
