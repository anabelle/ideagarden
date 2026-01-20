---
description: Deployment and production tasks
---

# Deployment Workflow

## Vercel Deployment (Recommended)

### Setup
```bash
npm install -g vercel
vercel login
vercel link
```

### Deploy
```bash
vercel --prod
```

### Environment Variables
Set in Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `TELEGRAM_BOT_TOKEN`

## Docker Deployment

### Build
```bash
docker build -t ideagarden .
```

### Run
```bash
docker run -p 3000:3000 --env-file .env.local ideagarden
```

## Pre-deployment Checklist

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Telegram webhook configured
