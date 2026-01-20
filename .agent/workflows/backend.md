---
description: Backend and API development tasks
---

# Backend Development Workflow

Use this workflow for Phase 1 (Core Engine) and Phase 2 (REST API) tasks.

---

## Phase 1: Core Engine

The core engine is a pure TypeScript service that handles all garden logic.
Location: `/src/lib/services/garden-service.ts`

### Task 1.1: Seed CRUD Operations

Implement in `/src/lib/services/garden-service.ts`:

```typescript
export class GardenService {
  // Create a new seed
  async plantSeed(userId: string, title: string, origin: string, author: Author): Promise<Seed>
  
  // Get all seeds for a user (organized by section)
  async getGarden(userId: string): Promise<GardenState>
  
  // Get a single seed by title or ID
  async getSeed(userId: string, identifier: string): Promise<Seed | null>
  
  // Update seed (internal use)
  private async updateSeed(seedId: string, data: Partial<Seed>): Promise<Seed>
}
```

### Task 1.2: Watering Logic with Auto-Promotion

Implement watering with automatic section promotion:

```typescript
async waterSeed(
  userId: string,
  seedTitle: string,
  content: string,
  author: Author
): Promise<WaterResult> {
  // 1. Find the seed
  // 2. Increment waterings
  // 3. Add log entry
  // 4. Check for promotion:
  //    - 3 waterings → move to SPROUTING
  //    - 5 waterings → move to READY_TO_HARVEST
  // 5. Return result with new count and any promotion
}
```

### Task 1.3: Harvesting Logic

```typescript
async harvestSeed(
  userId: string,
  seedTitle: string,
  taskDescription?: string,
  author: Author
): Promise<HarvestResult> {
  // 1. Verify seed has 5+ waterings
  // 2. Add harvest log entry
  // 3. Move to COMPOST section
  // 4. Set status to HARVESTED
  // 5. Return harvest summary with full log
}
```

### Task 1.4: Composting Logic

```typescript
async compostSeed(
  userId: string,
  seedTitle: string,
  reason?: string,
  author: Author
): Promise<void> {
  // 1. Find seed
  // 2. Add compost log entry with reason
  // 3. Move to COMPOST section
  // 4. Set status to COMPOSTED
  // 5. Enforce max 5 items in compost (purge oldest)
}
```

### Task 1.5: Semantic Similarity Engine

Create `/src/lib/services/similarity-service.ts`:

```typescript
export class SimilarityService {
  // Extract keywords from text
  extractKeywords(text: string): Set<string>
  
  // Calculate Jaccard similarity between two texts
  calculateSimilarity(text1: string, text2: string): number
  
  // Find similar seeds (threshold: 30% for blocking, 25% for consolidation)
  async findSimilarSeeds(
    userId: string,
    title: string,
    threshold: number = 0.30
  ): Promise<SimilarSeed[]>
}

// Stopwords to filter out
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
  'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our',
  'via', 'use', 'using', 'into', 'during', 'before', 'after', 'about',
  'between', 'through', 'under', 'over', 'each', 'all', 'any', 'both',
  'more', 'most', 'other'
]);
```

### Task 1.6: Merge/Consolidate Logic

```typescript
// Merge multiple seeds into one
async mergeSeed(
  userId: string,
  primaryTitle: string,
  mergeTitles: string[],
  synthesisContent: string,
  author: Author
): Promise<MergeResult>

// Get suggestions for similar seeds that could be merged
async getConsolidationSuggestions(userId: string): Promise<MergeGroup[]>
```

### Task 1.7: Unified Garden Service

Create the main entry point that combines all services:

```typescript
// /src/lib/services/index.ts
export class UnifiedGardenService {
  private gardenService: GardenService;
  private similarityService: SimilarityService;
  
  // Expose all actions
  async read(userId: string): Promise<GardenState>
  async plant(userId: string, title: string, origin: string): Promise<PlantResult>
  async water(userId: string, title: string, content: string): Promise<WaterResult>
  async harvest(userId: string, title: string): Promise<HarvestResult>
  async compost(userId: string, title: string, reason?: string): Promise<void>
  async merge(userId: string, primary: string, others: string[], synthesis: string): Promise<MergeResult>
  async consolidate(userId: string): Promise<MergeGroup[]>
}
```

### Task 1.8: Unit Tests

Create tests in `/src/lib/services/__tests__/`:

```typescript
// garden-service.test.ts
describe('GardenService', () => {
  test('plants a new seed correctly')
  test('waters a seed and increments count')
  test('promotes seed to sprouting at 3 waterings')
  test('promotes seed to ready at 5 waterings')
  test('harvests only seeds with 5+ waterings')
  test('enforces max 5 items in compost')
})

// similarity-service.test.ts
describe('SimilarityService', () => {
  test('extracts keywords correctly')
  test('filters stopwords')
  test('calculates Jaccard similarity')
  test('finds similar seeds above threshold')
})
```

Run tests:
```bash
npm test
```

---

## Phase 2: REST API

Create API routes in `/src/app/api/garden/`:

### Task 2.1: GET /api/garden

```typescript
// /src/app/api/garden/route.ts
export async function GET(request: Request) {
  // 1. Get user from session
  // 2. Call gardenService.read(userId)
  // 3. Return garden state as JSON
}
```

### Task 2.2-2.7: Action Endpoints

Create routes for each action:
- `POST /api/garden/plant` → `plant/route.ts`
- `POST /api/garden/water` → `water/route.ts`
- `POST /api/garden/harvest` → `harvest/route.ts`
- `POST /api/garden/compost` → `compost/route.ts`
- `POST /api/garden/merge` → `merge/route.ts`
- `GET /api/garden/consolidate` → `consolidate/route.ts`

Each route should:
1. Validate request body
2. Get authenticated user
3. Call appropriate service method
4. Return standardized response

### Task 2.8: Authentication Middleware

Set up NextAuth.js:

```bash
npm install next-auth @auth/prisma-adapter
```

Create `/src/app/api/auth/[...nextauth]/route.ts`:
- Configure providers (email, Telegram OAuth)
- Set up Prisma adapter
- Define session callback

### Task 2.9: API Integration Tests

Create tests for each endpoint:
- Test authentication required
- Test success cases
- Test error cases (validation, not found, etc.)
- Test similarity blocking for plant

---

## Code Quality Checks

Before marking backend tasks complete:

// turbo
```bash
cd /home/ana/Code/ideagarden && npm run lint && npm run type-check
```

// turbo
```bash
cd /home/ana/Code/ideagarden && npm test
```
