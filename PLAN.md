# 🌱 Idea Garden - Implementation Plan

> A standalone application for incubating ideas using a gardening metaphor.
> Ideas start as **seeds**, get **watered** with new thoughts, and when mature (5+ waterings), can be **harvested** into actionable tasks.

---

## Project Overview

**Tech Stack:**
- **Frontend:** Next.js 14+ with App Router, React 18+, TypeScript
- **Styling:** Vanilla CSS with CSS Variables (2026 glassmorphism design)
- **Backend:** Next.js API Routes + Node.js services
- **Database:** PostgreSQL with Prisma ORM
- **Telegram:** Telegraf.js for bot + Mini App
- **Real-time:** WebSocket for live updates
- **Hosting:** Vercel (web) + Railway/Fly.io (services)

---

## Phase 0: Project Foundation (Current)

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 0.1 | Initialize Next.js project with TypeScript | [ ] | 15 min |
| 0.2 | Set up project structure (folders, configs) | [ ] | 20 min |
| 0.3 | Create design system (CSS variables, base styles) | [ ] | 30 min |
| 0.4 | Set up PostgreSQL + Prisma schema | [ ] | 30 min |
| 0.5 | Create core data models (Seed, Garden, User) | [ ] | 20 min |
| 0.6 | Initialize Git repository with .gitignore | [ ] | 5 min |

**Phase 0 Deliverable:** Empty Next.js app with design system and database ready.

---

## Phase 1: Core Engine (Backend)

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 1.1 | Implement Seed CRUD operations | [ ] | 45 min |
| 1.2 | Implement watering logic with auto-promotion | [ ] | 30 min |
| 1.3 | Implement harvesting logic | [ ] | 20 min |
| 1.4 | Implement composting logic | [ ] | 15 min |
| 1.5 | Implement semantic similarity engine (Jaccard) | [ ] | 45 min |
| 1.6 | Implement merge/consolidate logic | [ ] | 30 min |
| 1.7 | Create unified Garden Service abstraction | [ ] | 30 min |
| 1.8 | Write unit tests for core engine | [ ] | 45 min |

**Phase 1 Deliverable:** Fully functional garden engine with tests.

---

## Phase 2: REST API

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 2.1 | Create API route: GET /api/garden | [ ] | 20 min |
| 2.2 | Create API route: POST /api/garden/plant | [ ] | 25 min |
| 2.3 | Create API route: POST /api/garden/water | [ ] | 20 min |
| 2.4 | Create API route: POST /api/garden/harvest | [ ] | 15 min |
| 2.5 | Create API route: POST /api/garden/compost | [ ] | 15 min |
| 2.6 | Create API route: POST /api/garden/merge | [ ] | 20 min |
| 2.7 | Create API route: GET /api/garden/consolidate | [ ] | 15 min |
| 2.8 | Add authentication middleware (NextAuth) | [ ] | 45 min |
| 2.9 | Write API integration tests | [ ] | 30 min |

**Phase 2 Deliverable:** Complete REST API with authentication.

---

## Phase 3: Web UI - Foundation

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 3.1 | Create app layout with navigation | [ ] | 30 min |
| 3.2 | Build SeedCard component | [ ] | 45 min |
| 3.3 | Build GardenSection component | [ ] | 30 min |
| 3.4 | Build GardenOverview (dashboard) page | [ ] | 45 min |
| 3.5 | Add glassmorphism styling to components | [ ] | 30 min |
| 3.6 | Implement dark mode theme | [ ] | 20 min |
| 3.7 | Add responsive design (mobile/tablet/desktop) | [ ] | 30 min |

**Phase 3 Deliverable:** Beautiful garden dashboard view.

---

## Phase 4: Web UI - Interactions

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 4.1 | Build PlantSeedModal with similarity warning | [ ] | 45 min |
| 4.2 | Build WaterSeedModal with prompts | [ ] | 30 min |
| 4.3 | Build SeedDetailView with history | [ ] | 45 min |
| 4.4 | Implement micro-animations (plant, water, harvest) | [ ] | 60 min |
| 4.5 | Add keyboard shortcuts | [ ] | 20 min |
| 4.6 | Build HarvestCelebration component | [ ] | 30 min |
| 4.7 | Implement real-time updates (WebSocket/SWR) | [ ] | 45 min |

**Phase 4 Deliverable:** Fully interactive garden with animations.

---

## Phase 5: Gamification System

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 5.1 | Design XP and level database schema | [ ] | 20 min |
| 5.2 | Implement XP earning logic | [ ] | 30 min |
| 5.3 | Implement streak tracking | [ ] | 30 min |
| 5.4 | Create achievements/badges system | [ ] | 45 min |
| 5.5 | Build StatsPanel component | [ ] | 30 min |
| 5.6 | Build AchievementUnlock animation | [ ] | 30 min |
| 5.7 | Implement garden themes unlock system | [ ] | 30 min |

**Phase 5 Deliverable:** Full gamification with XP, streaks, badges.

---

## Phase 6: Telegram Bot

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 6.1 | Register bot with @BotFather | [ ] | 10 min |
| 6.2 | Set up Telegraf.js bot server | [ ] | 30 min |
| 6.3 | Implement /start and /help commands | [ ] | 20 min |
| 6.4 | Implement /garden command | [ ] | 25 min |
| 6.5 | Implement /plant command with conversation | [ ] | 40 min |
| 6.6 | Implement /water command with conversation | [ ] | 30 min |
| 6.7 | Implement /harvest and /compost commands | [ ] | 25 min |
| 6.8 | Add similar seed warnings with inline buttons | [ ] | 30 min |
| 6.9 | Implement inline mode (@bot search) | [ ] | 30 min |
| 6.10 | Set up daily reminder notifications | [ ] | 30 min |

**Phase 6 Deliverable:** Fully functional Telegram bot.

---

## Phase 7: Telegram Mini App

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 7.1 | Set up Mini App configuration | [ ] | 20 min |
| 7.2 | Create Mini App layout (mobile-first) | [ ] | 30 min |
| 7.3 | Build compact SeedCard for Mini App | [ ] | 30 min |
| 7.4 | Implement tap-to-water interaction | [ ] | 25 min |
| 7.5 | Implement swipe actions (compost/water) | [ ] | 40 min |
| 7.6 | Add "daily card" streak mechanic | [ ] | 30 min |
| 7.7 | Implement share buttons (to chats) | [ ] | 25 min |
| 7.8 | Style for Telegram native look | [ ] | 30 min |

**Phase 7 Deliverable:** Telegram Mini App with full garden functionality.

---

## Phase 8: Onboarding & Landing Page

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 8.1 | Create landing page hero section | [ ] | 45 min |
| 8.2 | Build "How It Works" section | [ ] | 30 min |
| 8.3 | Create pricing section | [ ] | 25 min |
| 8.4 | Build first-run onboarding flow | [ ] | 60 min |
| 8.5 | Create starter garden templates | [ ] | 30 min |
| 8.6 | Implement SEO meta tags | [ ] | 15 min |
| 8.7 | Add social proof/testimonials section | [ ] | 20 min |

**Phase 8 Deliverable:** Marketing landing page and smooth onboarding.

---

## Phase 9: Advanced Features

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 9.1 | Build search with filters | [ ] | 45 min |
| 9.2 | Implement harvest share cards | [ ] | 40 min |
| 9.3 | Build public garden view ("garden tours") | [ ] | 45 min |
| 9.4 | Implement seed gifting | [ ] | 40 min |
| 9.5 | Build referral system | [ ] | 45 min |
| 9.6 | Add PWA support (offline, install) | [ ] | 40 min |
| 9.7 | Implement push notifications | [ ] | 35 min |

**Phase 9 Deliverable:** Viral features and PWA.

---

## Phase 10: Polish & Launch

| # | Task | Status | Est. Time |
|---|------|--------|-----------|
| 10.1 | Accessibility audit (WCAG AAA) | [ ] | 60 min |
| 10.2 | Performance optimization | [ ] | 45 min |
| 10.3 | Set up analytics events | [ ] | 30 min |
| 10.4 | Create production deployment pipeline | [ ] | 45 min |
| 10.5 | Write user documentation | [ ] | 30 min |
| 10.6 | Final QA testing | [ ] | 60 min |
| 10.7 | Launch! 🚀 | [ ] | - |

**Phase 10 Deliverable:** Production-ready application.

---

## Future Phases (Post-Launch)

- WhatsApp bot integration
- Browser extension
- Voice shortcuts (Siri/Google)
- Collaborative gardens
- AI gardening assistant
- External integrations (Linear, Notion, GitHub)

---

## Time Estimates Summary

| Phase | Est. Time |
|-------|-----------|
| Phase 0: Foundation | 2 hours |
| Phase 1: Core Engine | 4.5 hours |
| Phase 2: REST API | 3.5 hours |
| Phase 3: Web UI Foundation | 4 hours |
| Phase 4: Web UI Interactions | 4.5 hours |
| Phase 5: Gamification | 3.5 hours |
| Phase 6: Telegram Bot | 4.5 hours |
| Phase 7: Telegram Mini App | 4 hours |
| Phase 8: Onboarding & Landing | 4 hours |
| Phase 9: Advanced Features | 5 hours |
| Phase 10: Polish & Launch | 4.5 hours |
| **TOTAL** | **~44 hours** |

---

## Notes

- Each phase builds on the previous
- MVP = Phases 0-4 (web app with core features)
- Telegram = Phases 6-7 (primary distribution channel)
- Gamification can be parallelized with other phases
