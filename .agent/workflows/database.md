---
description: Database setup and management tasks
---

# Database Workflow

## PostgreSQL Setup

### Docker (Recommended)
```bash
docker run --name ideagarden-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ideagarden -p 5432:5432 -d postgres:15
```

Add to `.env.local`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ideagarden"
```

## Prisma Commands

```bash
# Initialize
npm install prisma @prisma/client
npx prisma init

# After schema changes
npx prisma migrate dev --name <migration_name>

# Generate client
npx prisma generate

# View database
npx prisma studio

# Reset (destroys data)
npx prisma migrate reset
```

## Key Models

- **User** - Auth + gamification (xp, level, streak)
- **Seed** - Ideas with title, origin, waterings, section
- **WateringLog** - History of all interactions
- **Achievement** - Badges and rewards
- **Streak** - Daily/weekly/monthly tracking
