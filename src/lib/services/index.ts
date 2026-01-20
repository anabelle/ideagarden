/**
 * 🌱 Idea Garden - Unified Garden Service
 * 
 * The primary entry point for all garden operations.
 * Orchestrates multiple specialized services (Garden, Similarity, etc.).
 */

import { GardenService } from './garden-service';
import { SimilarityService, SimilarSeedResult } from './similarity-service';
import { Seed, GardenOverview, Author } from '@/types';

export class UnifiedGardenService {
    private gardenService: GardenService;
    private similarityService: SimilarityService;

    constructor() {
        this.gardenService = new GardenService();
        this.similarityService = new SimilarityService();
    }

    /**
     * Get the full garden view
     */
    async getGarden(userId: string): Promise<GardenOverview> {
        return this.gardenService.getGarden(userId);
    }

    /**
     * Plant a new seed, but check for similarities first
     */
    /**
     * Plant a new seed, but check for similarities first
     */
    async plant(
        userId: string,
        title: string,
        origin: string,
        author: Author = 'HUMAN',
        force: boolean = false
    ): Promise<{ seed?: Seed; similarSeeds: SimilarSeedResult[]; blocked: boolean; achievements?: string[] }> {
        // Check for high similarities (threshold 0.4 for auto-block/warning)
        const similarSeeds = await this.similarityService.findSimilarSeeds(userId, title, 0.25);

        // If a very similar seed exists (> 0.6 similarity), we consider it a duplicate and block
        const isDuplicate = similarSeeds.some(s => s.similarity > 0.6);

        if (isDuplicate && !force) {
            return { similarSeeds, blocked: true };
        }

        const result = await this.gardenService.plantSeed(userId, title, origin, author);
        return { seed: result.seed, similarSeeds, blocked: false, achievements: result.achievements };
    }

    /**
     * Water a seed and get updated state
     */
    async water(
        userId: string,
        seedId: string,
        content: string,
        author: Author = 'HUMAN'
    ) {
        return this.gardenService.waterSeed(userId, seedId, content, author);
    }

    /**
     * Harvest a mature seed
     */
    async harvest(
        userId: string,
        seedId: string,
        author: Author = 'HUMAN'
    ) {
        return this.gardenService.harvestSeed(userId, seedId, author);
    }

    /**
     * Compost a seed
     */
    async compost(
        userId: string,
        seedId: string,
        reason?: string,
        author: Author = 'HUMAN'
    ) {
        return this.gardenService.compostSeed(userId, seedId, reason, author);
    }

    /**
     * Merge similar seeds
     */
    async merge(
        userId: string,
        primarySeedId: string,
        otherSeedIds: string[],
        synthesisContent: string,
        author: Author = 'HUMAN'
    ) {
        return this.gardenService.mergeSeeds(userId, primarySeedId, otherSeedIds, synthesisContent, author);
    }

    /**
     * Get suggestions for seeds that could be merged
     */
    async getConsolidationSuggestions(userId: string) {
        // This is a more complex logic that finds clusters of similar seeds
        // For now, we'll return seeds with > 0.3 similarity
        const allSeeds = await this.gardenService.getGarden(userId);
        const activeSeeds = [...allSeeds.seeds, ...allSeeds.sprouting, ...allSeeds.readyToHarvest];

        const suggestions = [];
        const processed = new Set<string>();

        for (const seed of activeSeeds) {
            if (processed.has(seed.id)) continue;

            const similar = await this.similarityService.findSimilarSeeds(userId, seed.title, 0.3);
            const group = similar.filter(s => s.seed.id !== seed.id);

            if (group.length > 0) {
                suggestions.push({
                    primary: seed,
                    others: group.map(g => g.seed),
                    similarity: group[0].similarity,
                });

                processed.add(seed.id);
                group.forEach(g => processed.add(g.seed.id));
            }
        }

        return suggestions;
    }
}

// Export a singleton instance
export const garden = new UnifiedGardenService();
