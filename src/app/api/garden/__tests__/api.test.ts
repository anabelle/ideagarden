/**
 * 🌱 Idea Garden - API Integration Tests
 * 
 * Tests for all garden API endpoints
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';

// Mock auth before anything else loads that might import it
jest.mock('@/lib/auth', () => ({
    auth: jest.fn(),
    handlers: { GET: jest.fn(), POST: jest.fn() },
    signIn: jest.fn(),
    signOut: jest.fn(),
}));

// Import route handlers
import { GET as getGarden } from '@/app/api/garden/route';
import { POST as plantSeed } from '@/app/api/garden/plant/route';
import { POST as waterSeed } from '@/app/api/garden/water/route';
import { POST as harvestSeed } from '@/app/api/garden/harvest/route';
import { POST as compostSeed } from '@/app/api/garden/compost/route';
import { POST as mergeSeeds } from '@/app/api/garden/merge/route';
import { GET as getConsolidations } from '@/app/api/garden/consolidate/route';

// Mock user ID for testing
const TEST_USER_ID = 'test_user_api_integration';

beforeAll(async () => {
    // Create test user if not exists
    await prisma.user.upsert({
        where: { id: TEST_USER_ID },
        update: {},
        create: {
            id: TEST_USER_ID,
            email: 'api-test@example.com',
            name: 'API Tester',
            xp: 0,
            level: 1,
        },
    });
});

afterAll(async () => {
    // Cleanup test data
    await prisma.seed.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.user.delete({ where: { id: TEST_USER_ID } });
    await prisma.$disconnect();
});

/**
 * Helper to create a mock NextRequest
 */
function createMockRequest(
    path: string,
    options: {
        method?: string;
        body?: object;
        userId?: string;
    } = {}
): NextRequest {
    const { method = 'GET', body, userId = TEST_USER_ID } = options;

    const url = new URL(path, 'http://localhost:3000');

    const request = new NextRequest(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    return request;
}

/**
 * Helper to parse JSON response
 */
async function parseResponse<T>(response: Response): Promise<T> {
    return response.json() as Promise<T>;
}

describe('Garden API Integration Tests', () => {
    describe('GET /api/garden', () => {
        it('should return 401 without user ID', async () => {
            const request = createMockRequest('/api/garden', { userId: '' });
            const response = await getGarden(request);

            expect(response.status).toBe(401);
            const data = await parseResponse<{ error: string }>(response);
            expect(data.error).toContain('Unauthorized');
        });

        it('should return garden state for authenticated user', async () => {
            const request = createMockRequest('/api/garden');
            const response = await getGarden(request);

            expect(response.status).toBe(200);
            const data = await parseResponse<{
                seeds: unknown[];
                sprouting: unknown[];
                readyToHarvest: unknown[];
                composted: unknown[];
                stats: object;
            }>(response);

            expect(data).toHaveProperty('seeds');
            expect(data).toHaveProperty('sprouting');
            expect(data).toHaveProperty('readyToHarvest');
            expect(data).toHaveProperty('composted');
            expect(data).toHaveProperty('stats');
        });
    });

    describe('POST /api/garden/plant', () => {
        it('should return 401 without user ID', async () => {
            const request = createMockRequest('/api/garden/plant', {
                method: 'POST',
                body: { title: 'Test', origin: 'test' },
                userId: '',
            });
            const response = await plantSeed(request);

            expect(response.status).toBe(401);
        });

        it('should return 400 with missing title', async () => {
            const request = createMockRequest('/api/garden/plant', {
                method: 'POST',
                body: { origin: 'test' },
            });
            const response = await plantSeed(request);

            expect(response.status).toBe(400);
            const data = await parseResponse<{ error: string }>(response);
            expect(data.error).toContain('Title');
        });

        it('should return 400 with missing origin', async () => {
            const request = createMockRequest('/api/garden/plant', {
                method: 'POST',
                body: { title: 'Test Idea' },
            });
            const response = await plantSeed(request);

            expect(response.status).toBe(400);
            const data = await parseResponse<{ error: string }>(response);
            expect(data.error).toContain('Origin');
        });

        it('should successfully plant a seed', async () => {
            const request = createMockRequest('/api/garden/plant', {
                method: 'POST',
                body: {
                    title: `API Test Seed ${Date.now()}`,
                    origin: 'integration test'
                },
            });
            const response = await plantSeed(request);

            expect(response.status).toBe(201);
            const data = await parseResponse<{
                seed: { id: string; title: string };
                blocked: boolean;
            }>(response);

            expect(data.blocked).toBe(false);
            expect(data.seed).toBeDefined();
            expect(data.seed.title).toContain('API Test Seed');
        });
    });

    describe('POST /api/garden/water', () => {
        it('should return 400 with missing seedId', async () => {
            const request = createMockRequest('/api/garden/water', {
                method: 'POST',
                body: { content: 'Some thoughts' },
            });
            const response = await waterSeed(request);

            expect(response.status).toBe(400);
            const data = await parseResponse<{ error: string }>(response);
            expect(data.error).toContain('seedId');
        });

        it('should return 400 with missing content', async () => {
            const request = createMockRequest('/api/garden/water', {
                method: 'POST',
                body: { seedId: 'some-id' },
            });
            const response = await waterSeed(request);

            expect(response.status).toBe(400);
            const data = await parseResponse<{ error: string }>(response);
            expect(data.error).toContain('content');
        });

        it('should return 404 for non-existent seed', async () => {
            const request = createMockRequest('/api/garden/water', {
                method: 'POST',
                body: { seedId: 'non-existent-id', content: 'Some thoughts' },
            });
            const response = await waterSeed(request);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/garden/harvest', () => {
        it('should return 400 with missing seedId', async () => {
            const request = createMockRequest('/api/garden/harvest', {
                method: 'POST',
                body: {},
            });
            const response = await harvestSeed(request);

            expect(response.status).toBe(400);
            const data = await parseResponse<{ error: string }>(response);
            expect(data.error).toContain('seedId');
        });

        it('should return 404 for non-existent seed', async () => {
            const request = createMockRequest('/api/garden/harvest', {
                method: 'POST',
                body: { seedId: 'non-existent-id' },
            });
            const response = await harvestSeed(request);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/garden/compost', () => {
        it('should return 400 with missing seedId', async () => {
            const request = createMockRequest('/api/garden/compost', {
                method: 'POST',
                body: {},
            });
            const response = await compostSeed(request);

            expect(response.status).toBe(400);
            const data = await parseResponse<{ error: string }>(response);
            expect(data.error).toContain('seedId');
        });

        it('should return 404 for non-existent seed', async () => {
            const request = createMockRequest('/api/garden/compost', {
                method: 'POST',
                body: { seedId: 'non-existent-id', reason: 'Testing' },
            });
            const response = await compostSeed(request);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/garden/merge', () => {
        it('should return 400 with missing primarySeedId', async () => {
            const request = createMockRequest('/api/garden/merge', {
                method: 'POST',
                body: { otherSeedIds: ['id1'], synthesisContent: 'Combined' },
            });
            const response = await mergeSeeds(request);

            expect(response.status).toBe(400);
            const data = await parseResponse<{ error: string }>(response);
            expect(data.error).toContain('primarySeedId');
        });

        it('should return 400 with empty otherSeedIds', async () => {
            const request = createMockRequest('/api/garden/merge', {
                method: 'POST',
                body: { primarySeedId: 'id1', otherSeedIds: [], synthesisContent: 'Combined' },
            });
            const response = await mergeSeeds(request);

            expect(response.status).toBe(400);
            const data = await parseResponse<{ error: string }>(response);
            expect(data.error).toContain('otherSeedIds');
        });

        it('should return 400 with missing synthesisContent', async () => {
            const request = createMockRequest('/api/garden/merge', {
                method: 'POST',
                body: { primarySeedId: 'id1', otherSeedIds: ['id2'] },
            });
            const response = await mergeSeeds(request);

            expect(response.status).toBe(400);
            const data = await parseResponse<{ error: string }>(response);
            expect(data.error).toContain('synthesisContent');
        });
    });

    describe('GET /api/garden/consolidate', () => {
        it('should return 401 without user ID', async () => {
            const request = createMockRequest('/api/garden/consolidate', { userId: '' });
            const response = await getConsolidations(request);

            expect(response.status).toBe(401);
        });

        it('should return consolidation suggestions', async () => {
            const request = createMockRequest('/api/garden/consolidate');
            const response = await getConsolidations(request);

            expect(response.status).toBe(200);
            const data = await parseResponse<{
                suggestions: unknown[];
                count: number;
                message: string;
            }>(response);

            expect(data).toHaveProperty('suggestions');
            expect(data).toHaveProperty('count');
            expect(data).toHaveProperty('message');
            expect(Array.isArray(data.suggestions)).toBe(true);
        });
    });
});
