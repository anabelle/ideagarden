# 📝 Changelog

All notable changes to the Idea Garden project.

---

## [Unreleased]

### Added
- Project initialization
- Implementation plan (PLAN.md)
- Status tracking (STATUS.md)
- Blocker tracking (BLOCKERS.md)
- Workflow system for multi-session development
- **Next.js 16.1.4 project** with TypeScript, ESLint, App Router
- **Design System** - Vanilla CSS with glassmorphism, dark mode first
- **Landing page** - Hero, How It Works, Features, Stats sections
- Inter + JetBrains Mono fonts via next/font
- **Docker Compose** - PostgreSQL 16 + Redis 7 for local dev
- **Dockerfile** - Multi-stage production build
- **Prisma 7** - Database ORM with PostgreSQL adapter
- **Core Models** - User, Seed, WateringLog, Tag, Achievement, Streak
- **Project Structure** - components, lib/services, lib/db, types
- **SeedCard Component** - First UI component with garden styling
- **Micro-animations** - Plant, water, grow, harvest animations

### Changed
- Removed Tailwind CSS in favor of vanilla CSS per spec

### Fixed
- N/A

---

## Session Log

### 2026-01-19 (Session 3) - Docker + Prisma + Structure

**Session Duration:** ~25 min

**Completed:**
- Task 0.2: Set up project structure
  - Created folder hierarchy (components/, lib/, types/, styles/)
  - Set up component barrel exports
  - Created TypeScript types for domain models
- Task 0.4: Set up Docker + Prisma
  - Docker Compose for PostgreSQL 16 + Redis 7
  - Production Dockerfile with multi-stage build
  - Prisma 7 with pg adapter
  - Database migration applied
- Task 0.5: Created core data models
  - User, Seed, WateringLog (core)
  - Tag, SeedTag (organization)
  - Achievement, UserAchievement, Streak (gamification)
  - Proper indexes and relations
- Created SeedCard component with styling
- Created utility functions (dates, XP, Jaccard similarity)
- Created animations.css with micro-interactions

**Next Session:**
- Task 0.6: Final git commit
- Start Phase 1: Core Engine

---

### 2026-01-19 (Session 2) - Next.js Init + Design System

**Session Duration:** ~20 min

**Completed:**
- Task 0.1: Initialized Next.js 16.1.4 with TypeScript
- Task 0.3: Created comprehensive design system (globals.css)
  - CSS variables for colors, typography, spacing
  - Glassmorphism utilities (glass-card, glass-blur)
  - Garden theme colors (seed green, water blue, harvest gold)
  - Dark mode first with light mode override
  - Micro-animations (fadeIn, slideUp, float, pulse)
- Created stunning landing page with:
  - Animated hero section with floating emojis
  - 3-step "How It Works" flow
  - Feature grid with gamification highlights
  - Stats section with glassmorphism

**Next Session:**
- Task 0.2: Set up project structure (folders, configs)
- Task 0.4: Set up PostgreSQL + Prisma

---

### 2026-01-19 - Project Setup

**Session Duration:** ~30 min

**Completed:**
- Created project structure
- Wrote comprehensive PLAN.md with 10 phases
- Set up workflow system for "continue" command
- Created STATUS.md for progress tracking
- Created BLOCKERS.md for issue tracking

**Next Session:**
- Task 0.1: Initialize Next.js project

---

## Version History

| Version | Date | Milestone |
|---------|------|-----------|
| v0.0.0 | 2026-01-19 | Project initialized |
| v0.1.0 | TBD | Phase 0 complete (Foundation) |
| v0.2.0 | TBD | Phase 1 complete (Core Engine) |
| v0.3.0 | TBD | Phase 2 complete (REST API) |
| v0.4.0 | TBD | Phase 3-4 complete (MVP Web UI) |
| v0.5.0 | TBD | Phase 5 complete (Gamification) |
| v0.6.0 | TBD | Phase 6-7 complete (Telegram) |
| v1.0.0 | TBD | Public launch! 🚀 |
