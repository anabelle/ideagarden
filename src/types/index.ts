/**
 * 🌱 Idea Garden - Core Types
 * 
 * These types define the core domain models for the application.
 */

// ===========================================
// ENUMS
// ===========================================

/** Status of a seed in the garden */
export type SeedStatus = 'ACTIVE' | 'HARVESTED' | 'COMPOSTED';

/** Which section of the garden the seed belongs to */
export type SeedSection = 'SEEDS' | 'SPROUTING' | 'READY_TO_HARVEST' | 'COMPOST';

/** Who created the content */
export type Author = 'HUMAN' | 'AI';

// ===========================================
// CORE MODELS
// ===========================================

/** A seed represents an idea in the garden */
export interface Seed {
    id: string;
    title: string;
    origin: string;
    waterings: number;
    status: SeedStatus;
    section: SeedSection;
    userId: string;
    plantedAt: Date;
    plantedBy: Author;
    updatedAt: Date;
    logs?: WateringLog[];
}

/** A watering log entry - adding thoughts to a seed */
export interface WateringLog {
    id: string;
    seedId: string;
    content: string;
    author: Author;
    createdAt: Date;
}

/** User profile */
export interface User {
    id: string;
    email?: string;
    telegramId?: string;
    name?: string;
    xp: number;
    level: number;
    createdAt: Date;
    updatedAt: Date;
}

/** Achievement/badge that can be unlocked */
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    condition: string;
}

/** User's unlocked achievement */
export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    unlockedAt: Date;
}

/** Daily streak tracking */
export interface Streak {
    id: string;
    userId: string;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
}

// ===========================================
// API TYPES
// ===========================================

/** Response for garden overview */
export interface GardenOverview {
    seeds: Seed[];
    sprouting: Seed[];
    readyToHarvest: Seed[];
    composted: Seed[];
    stats: {
        totalSeeds: number;
        totalWaterings: number;
        totalHarvested: number;
        currentStreak: number;
        xp: number;
        level: number;
    };
}

/** Request to plant a new seed */
export interface PlantSeedRequest {
    title: string;
    origin: string;
}

/** Request to water a seed */
export interface WaterSeedRequest {
    seedId: string;
    content: string;
}

/** Response after watering - may include promotion */
export interface WaterSeedResponse {
    seed: Seed;
    promoted: boolean;
    newSection?: SeedSection;
    xpEarned: number;
}

/** Similar seeds found during planting */
/** Similar seeds found during planting */
export interface SimilarSeedResult {
    seed: Seed;
    similarity: number;
}
