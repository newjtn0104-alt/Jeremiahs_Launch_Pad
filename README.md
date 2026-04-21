# Jeremiah's Launch Pad

A modern, glassmorphism-style dashboard for Jeremiah's Italian Ice operations. Built with Next.js, shadcn/ui, and Tailwind CSS.

## 🚀 Live Demo

**URL:** [Your Vercel URL here]

## ✨ Features

### Dashboard Components

1. **💭 Sweet Saying** - Daily inspirational quote (editable)
2. **👥 Who's Working** - Live attendance from Revel API
3. **🎯 Tasty Targets** - Daily sales targets with visual progress
4. **🔗 Quick Links** - WhatsUp Weekly PDF viewer, Sysco, Revel, 7shifts
5. **🐸 Froggy Focuses** - Toggleable daily operational checklist
6. **🚀 Sweet Start** - Quick action buttons
7. **📊 Revel Closing** - Real-time sales data with date picker

### Design Features

- **Glassmorphism UI** - Frosted glass cards with backdrop blur
- **Gradient backgrounds** - Blue to teal gradient
- **Smooth animations** - Fade-in, slide-up, hover effects
- **Responsive layout** - Works on desktop and mobile
- **Modern typography** - Inter font with gradient text
- **Animated background** - Floating gradient orbs

### Technical Features

- **Next.js 14** - React framework with App Router
- **shadcn/ui** - Accessible component library
- **Tailwind CSS** - Utility-first styling
- **Revel API Integration** - Real-time sales and labor data
- **Date picker** - View historical data
- **Auto-refresh** - Data updates every 5 minutes

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Deployment:** Vercel

## 📁 Project Structure

```
digital-launchpad/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── revel/
│   │   │   │   ├── closing/route.ts    # API endpoint for closing data
│   │   │   │   ├── labor/route.ts      # API endpoint for labor data
│   │   │   │   └── sales/route.ts      # API endpoint for sales data
│   │   │   ├── 7shifts/
│   │   │   │   └── schedule/route.ts   # 7shifts schedule API
│   │   │   └── files/
│   │   │       ├── serve/route.ts      # File serving
│   │   │       ├── upload/route.ts     # File upload
│   │   │       └── whatsup/route.ts    # WhatsUp Weekly files
│   │   ├── globals.css                 # Global styles with glassmorphism
│   │   ├── layout.tsx                  # Root layout
│   │   └── page.tsx                    # Main page
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── textarea.tsx
│   │   ├── LaunchPad.tsx               # Main dashboard layout
│   │   ├── SweetSaying.tsx             # Daily quote component
│   │   ├── WhosWorking.tsx             # Attendance component
│   │   ├── TastyTargets.tsx            # Sales targets component
│   │   ├── QuickLinks.tsx              # Links & PDF viewer
│   │   ├── FroggyFocuses.tsx           # Task checklist
│   │   ├── SweetStart.tsx              # Quick actions
│   │   └── RevelClosingLive.tsx        # Sales data viewer
│   └── lib/
│       └── utils.ts                    # Utility functions
├── public/
│   └── uploads/                        # WhatsUp Weekly PDFs
├── components.json                     # shadcn/ui config
├── next.config.mjs                     # Next.js config
├── tailwind.config.ts                  # Tailwind config
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/newjtn0104-alt/Jeremiahs_Launch_Pad.git
cd Jeremiahs_Launch_Pad
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## 🔌 API Integration

### Revel API

The dashboard connects to Revel API for real-time data:

**Endpoints:**
- `/api/revel/closing` - Daily closing report
- `/api/revel/labor` - Labor statistics
- `/api/revel/sales` - Sales data

**Features:**
- Excludes Payment Type 4 (refunds) for accurate totals
- Excludes cashiers ($0 wage) from labor calculations
- Calculates labor %: (Wages / Total Payments) × 100

### 7shifts API

Fetches employee schedules:
- `/api/7shifts/schedule` - Today's schedule

## 🎨 Customization

### Colors

Edit `src/app/globals.css`:

```css
:root {
  --background: 222 47% 11%;
  --primary: 217 91% 60%;
  /* ... */
}
```

### Glassmorphism

The glass effect uses:
```css
.glass-card {
  @apply bg-white/5 backdrop-blur-xl rounded-2xl 
         border border-white/10 shadow-2xl;
}
```

### Animations

Available animations in `globals.css`:
- `animate-fade-in` - Fade in effect
- `animate-slide-up` - Slide up effect
- `animate-pulse-soft` - Gentle pulse
- `hover-lift` - Hover elevation

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Deploy automatically

### Environment Variables

Create `.env.local`:
```
REVEL_API_KEY=your_key
REVEL_API_SECRET=your_secret
```

## 📝 Key Learnings

### Glassmorphism Implementation
- Use `backdrop-blur-xl` for strong blur
- Low opacity backgrounds (`bg-white/5`)
- Subtle borders (`border-white/10`)
- Layered shadows for depth

### shadcn/ui Integration
- Install with `npx shadcn@latest add [component]`
- Customize in `src/components/ui/`
- Combine with Tailwind utilities

### API Best Practices
- Filter data server-side
- Exclude invalid entries (Type 4 payments, $0 wages)
- Calculate percentages accurately
- Handle loading states with skeletons

### Performance
- Use Next.js Image component
- Implement loading skeletons
- Auto-refresh with intervals
- Lazy load components

## 🐛 Known Issues

1. **GitHub Token Authentication** - Personal access tokens in URLs don't work with newer GitHub policies. Use SSH or GitHub Desktop instead.

2. **CTB Data** - Expected/Actual Cash to Business data not available via Revel API. May need browser automation for this specific metric.

## 🔮 Future Improvements

- [ ] Dark/light mode toggle
- [ ] Push notifications for alerts
- [ ] Mobile app (PWA)
- [ ] Real-time WebSocket updates
- [ ] Advanced analytics charts
- [ ] Multi-location comparison
- [ ] Employee performance tracking

## 👥 Credits

Built by Atlas AI for Jeremiah's Italian Ice

## 📄 License

MIT License - feel free to use and modify!
# Deployment trigger Tue Apr  7 00:36:45 EDT 2026
// Redeploy trigger Tue Apr 21 14:44:13 EDT 2026
