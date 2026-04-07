"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SweetStart() {
  const steps = [
    { number: "1", text: "Ensure you're ready to start your shift. Are you in proper uniform? Stow your personal belongings. Take a restroom break if needed." },
    { number: "2", text: "CLOCK IN!" },
    { number: "3", text: "Have a Chill Chat at the LAUNCH PAD. Get up to speed on the expectations of your shift." },
    { number: "4", text: "Complete the GX360 and record results when applicable." },
    { number: "5", text: "Check Italian Ice and Soft Ice Cream quality and resolve any concerns." },
    { number: "6", text: "Create an Ice List. Confirm accuracy of the Production Whiteboard. Cross-reference the Production Whiteboard with current Ice levels." },
    { number: "7", text: "Organize the Ice List by the timing of production. Keep in mind what Ice Flavors we need: Immediately, Soon, Tonight. Be mindful of the order: Fruit flavors, Dairy flavors, Allergen flavors." },
    { number: "8", text: "Make the Ice Flavors that are currently needed for operation." },
    { number: "9", text: "Clean the production area and batch machine. Set the next person up for success!" },
    { number: "10", text: "Leap into the rest of your shift and LIVE LIFE TO THE COOLEST." },
  ];

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-start gap-4 p-4">
            <Badge className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100 flex items-center justify-center text-sm font-bold p-0">
              {step.number}
            </Badge>
            <p className="text-slate-700 text-sm leading-relaxed pt-1">
              {step.text}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
