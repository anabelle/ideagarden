/**
 * 🌱 Idea Garden - Garden Service
 * 
 * Core business logic for garden operations.
 * Handles seed lifecycle: planting, watering, sprouting, harvesting, composting.
 */

import prisma from '@/lib/db/prisma';
import {
    Seed,
    SeedSection,
    Author,
    GardenOverview
} from '@/types';

// Configuration for garden mechanics
export const SPROUTING_THRESHOLD = 3;
export const HARVEST_THRESHOLD = 5;
export const MAX_COMPOST_ITEMS = 5;

// XP Rewards
export const XP_PLANT = 10;
export const XP_WATER = 5;
export const XP_HARVEST = 50;

export class GardenService {
    /**
     * Plant a new seed
     */
    async plantSeed(
        userId: string,
        title: string,
        origin: string,
        author: Author = 'HUMAN'
    ): Promise<Seed> {
        const seed = await prisma.seed.create({
            data: {
                userId,
                title,
                origin,
                plantedBy: author,
                status: 'ACTIVE',
                section: 'SEEDS',
                waterings: 0,
            },
        });

        // Award XP for planting
        await this.awardXP(userId, XP_PLANT);

        return seed as unknown as Seed;
    }

    /**
     * Get the full garden state for a user
     */
    async getGarden(userId: string): Promise<GardenOverview> {
        const allSeeds = await prisma.seed.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });

        const activeSeeds = allSeeds.filter(s => s.status === 'ACTIVE');
        const harvestedSeeds = allSeeds.filter(s => s.status === 'HARVESTED');
        const compostedSeeds = allSeeds.filter(s => s.status === 'COMPOSTED');

        const seeds = activeSeeds.filter(s => s.section === 'SEEDS');
        const sprouting = activeSeeds.filter(s => s.section === 'SPROUTING');
        const readyToHarvest = activeSeeds.filter(s => s.section === 'READY_TO_HARVEST');

        // Aggregate stats
        const totalWaterings = activeSeeds.reduce((sum, s) => sum + s.waterings, 0);

        // Get user streak (handle missing streak)
        const streak = await prisma.streak.findUnique({ where: { userId } });

        return {
            seeds: seeds as unknown as Seed[],
            sprouting: sprouting as unknown as Seed[],
            readyToHarvest: readyToHarvest as unknown as Seed[],
            composted: compostedSeeds as unknown as Seed[],
            stats: {
                totalSeeds: activeSeeds.length,
                totalWaterings,
                totalHarvested: harvestedSeeds.length,
                currentStreak: streak?.currentStreak ?? 0,
            },
        };
    }

    /**
     * Get a single seed by ID or title
     */
    async getSeed(userId: string, identifier: string): Promise<Seed | null> {
        const seed = await prisma.seed.findFirst({
            where: {
                userId,
                OR: [
                    { id: identifier },
                    { title: { equals: identifier, mode: 'insensitive' } },
                ],
            },
            include: {
                logs: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        return seed as unknown as Seed | null;
    }

    /**
     * Update a seed
     */
    async updateSeed(seedId: string, data: Partial<Seed>): Promise<Seed> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { logs, ...updateData } = data;

        const seed = await prisma.seed.update({
            where: { id: seedId },
            data: updateData as any,
        });
        return seed as unknown as Seed;
    }

    /**
     * Water a seed with new thoughts
     */
    async waterSeed(
        userId: string,
        seedId: string,
        content: string,
        author: Author = 'HUMAN'
    ): Promise<{ seed: Seed; promoted: boolean; newSection?: SeedSection }> {
        const seed = await prisma.seed.findUnique({
            where: { id: seedId },
        });

        if (!seed || seed.userId !== userId) {
            throw new Error('Seed not found');
        }

        if (seed.status !== 'ACTIVE') {
            throw new Error('Cannot water a harvested or composted seed');
        }

        const newWaterings = seed.waterings + 1;
        let newSection = seed.section;
        let promoted = false;

        // Promotion logic
        if (newWaterings >= HARVEST_THRESHOLD && seed.section !== 'READY_TO_HARVEST') {
            newSection = 'READY_TO_HARVEST';
            promoted = true;
        } else if (newWaterings >= SPROUTING_THRESHOLD && seed.section === 'SEEDS') {
            newSection = 'SPROUTING';
            promoted = true;
        }

        const updatedSeed = await prisma.seed.update({
            where: { id: seedId },
            data: {
                waterings: newWaterings,
                section: newSection,
                logs: {
                    create: {
                        content,
                        author,
                    },
                },
            },
        });

        // Award XP for watering
        await this.awardXP(userId, XP_WATER);

        return {
            seed: updatedSeed as unknown as Seed,
            promoted,
            newSection: promoted ? newSection as SeedSection : undefined,
        };
    }

    /**
     * Harvest a mature seed
     */
    async harvestSeed(
        userId: string,
        seedId: string,
        author: Author = 'HUMAN'
    ): Promise<Seed> {
        const seed = await prisma.seed.findUnique({
            where: { id: seedId },
        });

        if (!seed || seed.userId !== userId) {
            throw new Error('Seed not found');
        }

        if (seed.waterings < HARVEST_THRESHOLD) {
            throw new Error(`Seed is not mature enough to harvest. Needs ${HARVEST_THRESHOLD} waterings.`);
        }

        if (seed.status !== 'ACTIVE') {
            throw new Error('Seed is already harvested or composted');
        }

        const harvestedSeed = await prisma.seed.update({
            where: { id: seedId },
            data: {
                status: 'HARVESTED',
                section: 'COMPOST', // Harvested seeds move to the "harvested" part of the compost
                harvestedAt: new Date(),
                logs: {
                    create: {
                        content: 'Harvested!',
                        author,
                    },
                },
            },
        });

        // Award major XP for harvesting
        await this.awardXP(userId, XP_HARVEST);

        return harvestedSeed as unknown as Seed;
    }

    /**
     * Compost a seed (discard it)
     */
    async compostSeed(
        userId: string,
        seedId: string,
        reason: string = 'No reason provided',
        author: Author = 'HUMAN'
    ): Promise<Seed> {
        const seed = await prisma.seed.findUnique({
            where: { id: seedId },
        });

        if (!seed || seed.userId !== userId) {
            throw new Error('Seed not found');
        }

        // Update to composted
        const compostedSeed = await prisma.seed.update({
            where: { id: seedId },
            data: {
                status: 'COMPOSTED',
                section: 'COMPOST',
                logs: {
                    create: {
                        content: `Composted: ${reason}`,
                        author,
                    },
                },
            },
        });

        // Enforce max compost items (Purge oldest)
        await this.purgeOldCompost(userId);

        return compostedSeed as unknown as Seed;
    }

    /**
     * Purge old compost items if they exceed MAX_COMPOST_ITEMS
     */
    private async purgeOldCompost(userId: string): Promise<void> {
        const compostItems = await prisma.seed.findMany({
            where: {
                userId,
                status: { in: ['COMPOSTED', 'HARVESTED'] },
                section: 'COMPOST',
            },
            orderBy: { updatedAt: 'desc' },
        });

        if (compostItems.length > MAX_COMPOST_ITEMS) {
            const itemsToPurge = compostItems.slice(MAX_COMPOST_ITEMS);
            const idsToPurge = itemsToPurge.map(item => item.id);

            await prisma.seed.deleteMany({
                where: {
                    id: { in: idsToPurge },
                },
            });
        }
    }

    /**
     * Merge multiple seeds into one primary seed
     */
    async mergeSeeds(
        userId: string,
        primarySeedId: string,
        otherSeedIds: string[],
        synthesisContent: string,
        author: Author = 'HUMAN'
    ): Promise<Seed> {
        // 1. Verify all seeds belong to the user and are active
        const allIds = [primarySeedId, ...otherSeedIds];
        const seeds = await prisma.seed.findMany({
            where: {
                id: { in: allIds },
                userId,
                status: 'ACTIVE',
            },
        });

        if (seeds.length !== allIds.length) {
            throw new Error('One or more seeds not found or not active');
        }

        const primarySeed = seeds.find(s => s.id === primarySeedId)!;
        const otherSeeds = seeds.filter(s => s.id !== primarySeedId);

        // 2. Perform the merge transaction
        return await prisma.$transaction(async (tx) => {
            // Update other seeds to COMPOSTED and link them
            await tx.seed.updateMany({
                where: { id: { in: otherSeedIds } },
                data: {
                    status: 'COMPOSTED',
                    section: 'COMPOST',
                    mergedIntoId: primarySeedId,
                },
            });

            // Update primary seed: increment waterings and add log
            const totalNewWaterings = primarySeed.waterings + otherSeeds.reduce((sum, s) => sum + s.waterings, 0) + 1;

            // Check for promotion
            let newSection = primarySeed.section as SeedSection;
            if (totalNewWaterings >= HARVEST_THRESHOLD) {
                newSection = 'READY_TO_HARVEST';
            } else if (totalNewWaterings >= SPROUTING_THRESHOLD && primarySeed.section === 'SEEDS') {
                newSection = 'SPROUTING';
            }

            const updatedPrimary = await tx.seed.update({
                where: { id: primarySeedId },
                data: {
                    waterings: totalNewWaterings,
                    section: newSection,
                    logs: {
                        create: {
                            content: `Merged with [${otherSeeds.map(s => s.title).join(', ')}]. Synthesis: ${synthesisContent}`,
                            author,
                        },
                    },
                },
            });

            return updatedPrimary as unknown as Seed;
        });
    }

    /**
     * Award XP to a user and handle leveling up
     */
    private async awardXP(userId: string, amount: number): Promise<void> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;

        const newXP = user.xp + amount;
        const newLevel = this.calculateLevel(newXP);

        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: newXP,
                level: newLevel,
            },
        });
    }

    /**
     * Level calculation logic (Simple exponential curve)
     */
    private calculateLevel(xp: number): number {
        return Math.floor(Math.sqrt(xp / 10)) + 1;
    }
}
