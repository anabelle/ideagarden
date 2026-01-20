---
description: Frontend and UI development tasks
---

# Frontend Development Workflow

Use this workflow for Phase 3 (UI Foundation), Phase 4 (UI Interactions), and Phase 8 (Landing/Onboarding).

---

## Design System Reference

Before building any component, reference these from `globals.css`:

### Color Variables
```css
--bg-deep: hsl(220, 20%, 6%);
--bg-base: hsl(220, 18%, 10%);
--bg-elevated: hsl(220, 16%, 14%);
--seed-green: hsl(142, 70%, 45%);
--sprout-teal: hsl(162, 65%, 42%);
--harvest-pink: hsl(330, 80%, 65%);
--compost-amber: hsl(35, 60%, 40%);
--water-blue: hsl(205, 90%, 55%);
```

### Glassmorphism Pattern
```css
.glass-card {
  background: hsl(220, 20%, 15%, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid hsl(0, 0%, 100%, 0.08);
  border-radius: 16px;
}
```

---

## Phase 3: UI Foundation

### Task 3.1: App Layout with Navigation

Create `/src/app/layout.tsx`:
- Dark mode by default
- Root CSS variables
- Font loading (Inter Variable)
- Navigation component

Create `/src/components/ui/Navigation.tsx`:
- Logo + app name
- "Plant" button
- Search icon
- User menu

### Task 3.2: SeedCard Component

Create `/src/components/garden/SeedCard.tsx`:

```tsx
interface SeedCardProps {
  seed: Seed;
  onWater: () => void;
  onExpand: () => void;
  variant: 'compact' | 'expanded';
}

export function SeedCard({ seed, onWater, onExpand, variant }: SeedCardProps) {
  // Show:
  // - Title
  // - Watering progress bar (●●○○○)
  // - Stage icon (🌱/🌿/🌸/🍂)
  // - Quick water button
  // - Expand on click
}
```

Progress bar component:
```tsx
function WateringProgress({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="watering-progress">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < count ? 'filled' : 'empty'}>●</span>
      ))}
    </div>
  );
}
```

### Task 3.3: GardenSection Component

Create `/src/components/garden/GardenSection.tsx`:

```tsx
interface GardenSectionProps {
  title: string;
  icon: string;
  seeds: Seed[];
  emptyMessage: string;
  accentColor: string;
}

export function GardenSection({ title, icon, seeds, emptyMessage, accentColor }: GardenSectionProps) {
  // Collapsible section header with count
  // Grid of SeedCards
  // Empty state with message
}
```

### Task 3.4: GardenOverview Page

Create `/src/app/garden/page.tsx`:

```tsx
export default function GardenPage() {
  // Fetch garden state with SWR or React Query
  // Render 4 sections:
  // 1. 🌱 Seeds (0-2 waterings)
  // 2. 🌿 Sprouting (3-4 waterings)
  // 3. 🌸 Ready to Harvest (5+ waterings)
  // 4. 🍂 Compost (archived)
  
  // Highlight Ready to Harvest section
  // Show neglected seeds warning
}
```

### Task 3.5: Glassmorphism Styling

Apply to all cards and modals:
- Blur backdrop
- Subtle border glow on hover
- Smooth transitions
- Depth through shadow layers

### Task 3.6: Dark Mode Theme

Ensure full dark mode implementation:
- All surfaces use dark palette
- Text has proper contrast (WCAG AAA)
- No pure white (#fff) - use `--text-primary`
- Respect `prefers-color-scheme`

### Task 3.7: Responsive Design

Breakpoints:
- Mobile (<640px): Single column, full-width cards
- Tablet (640-1024px): 2-column grid
- Desktop (1024-1400px): 3-column grid
- Wide (>1400px): 4-column kanban style

---

## Phase 4: UI Interactions

### Task 4.1: PlantSeedModal

Create `/src/components/modals/PlantSeedModal.tsx`:

Features:
- Title input with real-time similarity check
- Similar seed warning with "Water this instead" button
- Origin textarea with placeholder suggestions
- Loading state during submission
- Success animation

### Task 4.2: WaterSeedModal

Create `/src/components/modals/WaterSeedModal.tsx`:

Features:
- Show seed title and current progress
- Textarea for new thought
- Rotating prompt suggestions ("What changed?", "Who benefits?", etc.)
- Submit button with loading state
- Progress bar animation on success

### Task 4.3: SeedDetailView

Create `/src/components/garden/SeedDetailView.tsx`:

Features:
- Full seed information
- Watering log timeline
- Inline water action
- Harvest/Compost actions (context-dependent)
- Share button
- Merge suggestion if similar seeds exist

### Task 4.4: Micro-Animations

Create `/src/styles/animations.css`:

```css
/* Seed planted - sprout pop-in */
@keyframes sprout-bounce {
  0% { transform: scale(0) translateY(20px); }
  60% { transform: scale(1.1) translateY(-5px); }
  100% { transform: scale(1) translateY(0); }
}

/* Watering - droplet splash */
@keyframes water-ripple {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* Ready to harvest - pulsing glow */
@keyframes harvest-pulse {
  0%, 100% { box-shadow: 0 0 20px var(--harvest-gold); }
  50% { box-shadow: 0 0 40px var(--harvest-gold); }
}

/* Harvested - confetti burst */
@keyframes confetti-fall {
  0% { transform: translateY(-100%) rotate(0deg); }
  100% { transform: translateY(100vh) rotate(720deg); }
}
```

Use Framer Motion for React integration:
```bash
npm install framer-motion
```

### Task 4.5: Keyboard Shortcuts

Implement global shortcuts:
- `N` - New seed (open PlantSeedModal)
- `W` - Water focused seed
- `Tab` - Navigate between seeds
- `Enter` - Expand/collapse seed
- `Escape` - Close modals

Create `/src/lib/hooks/useKeyboardShortcuts.ts`

### Task 4.6: HarvestCelebration

Create `/src/components/garden/HarvestCelebration.tsx`:

- Full-screen overlay
- Confetti animation
- "🌸 Harvested!" message
- Summary of the harvested seed
- Share button
- "What's next?" prompt

### Task 4.7: Real-Time Updates

Set up SWR for data fetching with real-time revalidation:

```typescript
// /src/lib/hooks/useGarden.ts
import useSWR from 'swr';

export function useGarden() {
  const { data, error, mutate } = useSWR('/api/garden', fetcher, {
    refreshInterval: 30000, // Refresh every 30s
    revalidateOnFocus: true,
  });
  
  return {
    garden: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
```

Consider WebSocket for instant updates in collaborative gardens.

---

## Phase 8: Landing & Onboarding

### Task 8.1: Landing Page Hero

Create `/src/app/page.tsx` (landing page):

```
🌱 Idea Garden

Stop hoarding ideas. Start growing them.

The app that makes you prove an idea is worth
building before you spend a single hour on it.

[🌱 Start Growing - Free]    [Watch Demo ▶️]
```

- Animated background (floating seeds?)
- Clear value proposition
- Single CTA button

### Task 8.2: "How It Works" Section

Three-step visual:
1. 🌱 Plant - Capture your idea
2. 💧 Water - Add a thought each day
3. 🌸 Harvest - Ship it (5+ waterings)

With animations on scroll.

### Task 8.3: Pricing Section

Free / Pro / Team tiers with feature comparison.

### Task 8.4: Onboarding Flow

Create `/src/app/onboarding/page.tsx`:

Multi-step wizard:
1. Welcome screen
2. Choose starter template (Builder/Creator/Pro/Empty)
3. Plant or water first seed
4. Success + streak hook
5. Enter garden

Use URL params or context to track step.

### Task 8.5: Starter Templates

Pre-populate seeds based on persona:
- Builder: "Side project idea", "Tool I wish existed", "Feature to ship"
- Creator: "Content to create", "Topic I love", "Skill to develop"
- Professional: "Career goal", "Project to propose", "Skill to level up"

### Task 8.6: SEO Meta Tags

Add to layout and pages:
- Title tags
- Meta descriptions
- Open Graph tags
- Twitter cards
- Structured data (JSON-LD)

### Task 8.7: Social Proof Section

Placeholder testimonials (replace with real ones in beta):
- Quote cards
- Star ratings
- User avatars

---

## Component Checklist

For each component, verify:
- [ ] TypeScript types defined
- [ ] Props interface documented
- [ ] Responsive on all breakpoints
- [ ] Keyboard accessible
- [ ] Screen reader friendly (ARIA labels)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Loading and error states handled
- [ ] Styled with design system variables

---

## Testing

// turbo
```bash
cd /home/ana/Code/ideagarden && npm run lint && npm run type-check
```

Visual testing:
```bash
cd /home/ana/Code/ideagarden && npm run dev
```

Then open browser to verify each component.
