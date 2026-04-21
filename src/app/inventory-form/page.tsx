"use client";

import InventoryForm from "@/components/InventoryForm";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function StandaloneInventoryForm() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="border-slate-200 shadow-md bg-white mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-xl bg-blue-600">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900">
                  Jeremiah&apos;s Italian Ice
                </h1>
                <p className="text-slate-500">Weekly Inventory Form</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <InventoryForm />

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-8">
          © {new Date().getFullYear()} Jeremiah&apos;s Italian Ice. All rights reserved.
        </p>
      </div>
    </div>
  );
}
