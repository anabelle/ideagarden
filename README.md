# 🌱 Idea Garden

> Grow your ideas from seeds to shipped projects.

A standalone application for incubating ideas using a gardening metaphor. Ideas start as **seeds**, get **watered** with new thoughts over time, and when mature (5+ waterings), can be **harvested** into actionable tasks.

## Why Idea Garden?

Traditional note apps are **passive storage** - you put ideas in, they sit there, you forget them.

Idea Garden is an **active system** that:
- **Validates** ideas through repeated engagement (5 waterings = worth pursuing)
- **Surfaces** neglected ideas before they die
- **Blocks** duplicates so you consolidate instead of scatter
- **Promotes** automatically so you see what's ready

**The insight:** Your brain is for thinking, not storage. Let the system remember and nudge.

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
docker run --name ideagarden-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ideagarden -p 5432:5432 -d postgres:15
cp .env.example .env.local
npx prisma migrate dev

# Run development server
npm run dev
```

## How It Works

| Stage | Waterings | What It Means |
|-------|-----------|---------------|
| 🌱 Seeds | 0-2 | New, unvalidated ideas |
| 🌿 Sprouting | 3-4 | Ideas gaining traction |
| 🌸 Ready to Harvest | 5+ | Mature ideas ready for action |
| 🍂 Compost | N/A | Archived/failed/harvested ideas |

## Tech Stack

- **Frontend:** Next.js 14+ with App Router
- **Styling:** Vanilla CSS with 2026 glassmorphism design
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma
- **Telegram:** Telegraf.js bot + Mini App

## Development

See [PLAN.md](./PLAN.md) for the full implementation roadmap.

To continue development:
```
/continue
```

## License

MIT
