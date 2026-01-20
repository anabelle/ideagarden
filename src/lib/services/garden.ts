/**
 * 🌱 Idea Garden - Garden Service
 * 
 * Core business logic for garden operations.
 * This is the main abstraction layer between the API and database.
 */

import type {
    Seed,
    GardenOverview,
    PlantSeedRequest,
    WaterSeedRequest,
    WaterSeedResponse,
    SimilarSeed
} from '@/types';

// Threshold for seed promotion
const SPROUTING_THRESHOLD = 2;
const HARVEST_THRESHOLD = 5;

// XP rewards
const XP_PLANT = 10;
const XP_WATER = 5;
const XP_HARVEST = 25;

/**
 * Get the full garden overview for a user
 */
export async function getGardenOverview(userId: string): Promise<GardenOverview> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented');
}

/**
 * Plant a new seed in the garden
 */
export async function plantSeed(
    userId: string,
    request: PlantSeedRequest
): Promise<{ seed: Seed; similarSeeds: SimilarSeed[] }> {
    // TODO: Implement with Prisma
    // 1. Check for similar seeds
    // 2. Create new seed
    // 3. Award XP
    throw new Error('Not implemented');
}

/**
 * Water a seed with new thoughts
 */
export async function waterSeed(
    userId: string,
    request: WaterSeedRequest
): Promise<WaterSeedResponse> {
    // TODO: Implement with Prisma
    // 1. Add watering log
    // 2. Increment waterings count
    // 3. Check for promotion
    // 4. Award XP
    throw new Error('Not implemented');
}

/**
 * Harvest a mature seed
 */
export async function harvestSeed(
    userId: string,
    seedId: string
): Promise<Seed> {
    // TODO: Implement with Prisma
    // 1. Verify seed is ready to harvest
    // 2. Update status to HARVESTED
    // 3. Award XP
    throw new Error('Not implemented');
}

/**
 * Compost a seed (mark as discarded)
 */
export async function compostSeed(
    userId: string,
    seedId: string
): Promise<Seed> {
    // TODO: Implement with Prisma
    throw new Error('Not implemented');
}

/**
 * Find similar seeds using Jaccard similarity
 */
export async function findSimilarSeeds(
    userId: string,
    title: string
): Promise<SimilarSeed[]> {
    // TODO: Implement Jaccard similarity
    throw new Error('Not implemented');
}

/**
 * Merge two similar seeds into one
 */
export async function mergeSeeds(
    userId: string,
    seedId1: string,
    seedId2: string
): Promise<Seed> {
    // TODO: Implement merge logic
    throw new Error('Not implemented');
}

/**
 * Determine which section a seed belongs to based on waterings
 */
export function determineSeedSection(waterings: number): Seed['section'] {
    if (waterings >= HARVEST_THRESHOLD) return 'READY_TO_HARVEST';
    if (waterings >= SPROUTING_THRESHOLD) return 'SPROUTING';
    return 'SEEDS';
}

export { SPROUTING_THRESHOLD, HARVEST_THRESHOLD, XP_PLANT, XP_WATER, XP_HARVEST };
