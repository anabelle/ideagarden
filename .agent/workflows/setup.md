---
description: Setup and configuration tasks (project init, dependencies, configs)
---

# Setup & Configuration Workflow

Use this workflow for Phase 0 tasks and any setup/configuration work.

---

## Task 0.1: Initialize Next.js Project

// turbo-all

### Steps:

1. Check if Node.js and npm are available:
```bash
node --version && npm --version
```

2. Create Next.js project with TypeScript:
```bash
cd /home/ana/Code/ideagarden && npx -y create-next-app@latest . --typescript --tailwind=no --eslint --app --src-dir --import-alias="@/*" --use-npm
```

**Note:** We disable Tailwind since we're using vanilla CSS per spec.

3. Verify the project was created:
```bash
ls -la /home/ana/Code/ideagarden
```

4. Test that it runs:
```bash
cd /home/ana/Code/ideagarden && npm run dev &
sleep 5 && curl -s http://localhost:3000 | head -20
```

5. Stop the dev server after verification.

---

## Task 0.2: Set Up Project Structure

Create the following folder structure:

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── garden/        # Garden API endpoints
│   ├── garden/            # Garden pages
│   ├── onboarding/        # Onboarding flow
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── garden/           # Garden-specific components
│   └── modals/           # Modal components
├── lib/                   # Shared utilities
│   ├── services/         # Business logic services
│   ├── db/               # Database utilities
│   └── utils/            # Helper functions
├── styles/               # Global styles
│   ├── globals.css       # Global CSS with design system
│   └── animations.css    # Micro-animations
└── types/                # TypeScript types
```

Commands to create structure:
```bash
cd /home/ana/Code/ideagarden/src
mkdir -p app/api/garden app/garden app/onboarding
mkdir -p components/ui components/garden components/modals
mkdir -p lib/services lib/db lib/utils
mkdir -p styles types
```

---

## Task 0.3: Create Design System

Create `/src/styles/globals.css` with the 2026 design system:
- CSS variables for colors (dark mode first)
- Typography scale
- Glassmorphism utilities
- Base component styles

See SPEC.md "Visual Design System" section for details.

---

## Task 0.4: Set Up PostgreSQL + Prisma

1. Install Prisma:
```bash
cd /home/ana/Code/ideagarden && npm install prisma @prisma/client
```

2. Initialize Prisma:
```bash
npx prisma init
```

3. Create the Prisma schema in `prisma/schema.prisma` with:
   - User model
   - Seed model
   - WateringLog model
   - Achievement model
   - Streak model

4. Create `.env.local` with database URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/ideagarden"
```

---

## Task 0.5: Create Core Data Models

Design and implement Prisma models based on the spec:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  telegramId String? @unique
  name      String?
  seeds     Seed[]
  xp        Int      @default(0)
  level     Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Seed {
  id          String   @id @default(cuid())
  title       String
  origin      String
  waterings   Int      @default(0)
  status      SeedStatus @default(ACTIVE)
  section     SeedSection @default(SEEDS)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  logs        WateringLog[]
  plantedAt   DateTime @default(now())
  plantedBy   Author   @default(HUMAN)
  updatedAt   DateTime @updatedAt
}

enum SeedStatus {
  ACTIVE
  HARVESTED
  COMPOSTED
}

enum SeedSection {
  SEEDS
  SPROUTING
  READY_TO_HARVEST
  COMPOST
}

enum Author {
  HUMAN
  AI
}
```

Run migration:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Task 0.6: Initialize Git Repository

```bash
cd /home/ana/Code/ideagarden
git init
git add .
git commit -m "Initial commit: Next.js project with Prisma setup"
```

Create `.gitignore` if not present with standard Next.js ignores plus:
- `.env.local`
- `.env*.local`
- `node_modules/`
- `.next/`

---

## Verification

After completing all Phase 0 tasks:

1. `npm run dev` should start without errors
2. `npx prisma studio` should open database viewer
3. Project structure should match the plan
4. All files should be committed to git
