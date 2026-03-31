"use client";

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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-3xl">🌅</span>
        Getting a Sweet Start
      </h2>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-3 bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {step.number}
            </div>
            <p className="text-white text-sm leading-relaxed pt-1">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
