---
description: Testing and quality assurance tasks
---

# Testing Workflow

## Quick Checks

// turbo
```bash
cd /home/ana/Code/ideagarden && npm run lint
```

// turbo
```bash
cd /home/ana/Code/ideagarden && npm run type-check
```

// turbo
```bash
cd /home/ana/Code/ideagarden && npm test
```

## Test Structure

```
src/
├── lib/services/__tests__/    # Service unit tests
├── app/api/__tests__/         # API integration tests
└── components/__tests__/      # Component tests
```

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## What to Test

### Backend
- Seed CRUD operations
- Watering auto-promotion
- Similarity detection
- Merge logic

### API
- Auth required
- Validation errors
- Success responses

### Frontend
- Component rendering
- User interactions
- Loading/error states
