"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Package, Save, AlertCircle, Loader2, CheckCircle } from "lucide-react";

const INVENTORY_ITEMS = [
  { id: "small_lid", label: "SMALL/Tadpole LID 7oz Dome" },
  { id: "medium_lid", label: "MEDIUM LID DNR640" },
  { id: "large_lid", label: "LARGE LID DNR626" },
  { id: "tadpole_cup", label: "Tadpole 5 oz Cup" },
  { id: "small_cups", label: "SMALL CUPS" },
  { id: "medium_cups", label: "MEDIUM CUPS TP22" },
  { id: "large_cup", label: "LARGE CUP TP16D" },
  { id: "half_gallon_container", label: "HALF GALLON CONTAINER" },
  { id: "half_gallon_lid", label: "HALF GALLON LID" },
  { id: "quart_container", label: "QUART CONTAINER/LID" },
  { id: "togo_carrier", label: "TOGO CARRIER" },
  { id: "green_spoons", label: "GREEN SPOONS" },
  { id: "register_roll", label: "REGISTER ROLL (Receipt Paper)" },
  { id: "thank_you_bag", label: "THANK YOU BAG (To Go Bags)" },
  { id: "translucent_cups", label: "TRANSLUCENT CUPS (Water Cups)" },
  { id: "souffle_cup", label: "SOUFFLE CUP (Pup Cups)" },
  { id: "vanilla_mix", label: "Vanilla Mix" },
  { id: "chocolate_mix", label: "Chocolate Mix" },
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
  { id: "crushed_pineapple", label: "Crushed Pineapple" },
  { id: "pineapple_juice", label: "Pineapple Juice" },
  { id: "peanut_butter", label: "Peanut Butter" },
  { id: "goya_coconut", label: "Goya Coconut" },
  { id: "cookie_butter_crumbs", label: "Cookie Butter Crumbs" },
  { id: "cake_batter", label: "Cake Batter" },
  { id: "water_bottles", label: "Water Bottles" },
  { id: "shredded_coconut", label: "Shredded Coconut" },
  { id: "sugar", label: "Sugar" },
  { id: "chocolate_chips", label: "Chocolate Chips" },
  { id: "oreo_cookies", label: "Oreo Cookies" },
  { id: "ic_sandwich_wafer", label: "IC Sandwich Wafer" },
  { id: "nerds", label: "Nerds" },
  { id: "rainbow_sprinkles", label: "Rainbow Sprinkles" },
  { id: "black_trash_bag", label: "BLACK TRASH BAG" },
  { id: "wypall", label: "WYPALL (Blue Rags)" },
  { id: "paper_towel_roll", label: "PAPER TOWEL ROLL (Brown Napkins)" },
  { id: "toilet_paper", label: "TOILET PAPER" },
  { id: "icm_lube", label: "ICM Lube" },
  { id: "sanitizer", label: "SANITIZER For Sink" },
  { id: "magic_eraser", label: "MAGIC ERASER" },
  { id: "handsoap", label: "HANDSOAP" },
  { id: "dishwashing_detergent", label: "Dishwashing Detergent" },
  { id: "mop_sink_cleaner", label: "MOP SINK CLEANER" },
  { id: "glass_cleaner", label: "Glass Cleaner" },
  { id: "vinyl_gloves", label: "VINYL GLOVES (Plastic Gloves)" },
  { id: "sheila_shine", label: "SHEILA SHINE (Stainless Steel Cleaner)" },
  { id: "wet_wipes", label: "WET WIPES" },
];

interface ParSettings {
  [itemId: string]: number;
}

export default function ParSettings() {
  const [parSettings, setParSettings] = useState<ParSettings>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load existing par settings
  useEffect(() => {
    fetchParSettings();
  }, []);

  const fetchParSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/par-settings");
      const data = await response.json();
      
      if (data.success) {
        // Convert array to object for easier lookup
        const settingsMap: ParSettings = {};
        data.settings.forEach((setting: any) => {
          settingsMap[setting.item_id] = setting.par_level;
        });
        setParSettings(settingsMap);
      }
    } catch (err) {
      console.error("Error fetching par settings:", err);
      // Don't show error on load - might be first time
    } finally {
      setLoading(false);
    }
  };

  const handleParChange = (itemId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setParSettings((prev) => ({
      ...prev,
      [itemId]: numValue,
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/par-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: parSettings }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to save settings");
      }
    } catch (err) {
      setError("Failed to save settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const setAllToZero = () => {
    const zeroSettings: ParSettings = {};
    INVENTORY_ITEMS.forEach((item) => {
      zeroSettings[item.id] = 0;
    });
    setParSettings(zeroSettings);
    setSuccess(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100">
                <Settings className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Par Settings</CardTitle>
                <p className="text-sm text-slate-500">
                  Set minimum stock levels. Items below par will show "Buy 1" alerts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={setAllToZero} disabled={saving}>
                Reset All
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Settings saved successfully!
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800">
              <strong>How it works:</strong> Enter the minimum quantity for each item. 
              When viewing inventory submissions, items below this level will show a "Buy 1" alert.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Par Settings Grid */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INVENTORY_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate" title={item.label}>
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-slate-500">Par:</span>
                    <Input
                      type="number"
                      min="0"
                      value={parSettings[item.id] || 0}
                      onChange={(e) => handleParChange(item.id, e.target.value)}
                      className="w-16 h-8 text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
