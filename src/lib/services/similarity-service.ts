/**
 * 🌱 Idea Garden - Similarity Service
 * 
 * Handles semantic similarity analysis using keyword extraction
 * and Jaccard similarity index.
 */

import prisma from '@/lib/db/prisma';
import { Seed } from '@/types';

// Stopwords to filter out for better keyword extraction
const STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
    'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our',
    'via', 'use', 'using', 'into', 'during', 'before', 'after', 'about',
    'between', 'through', 'under', 'over', 'each', 'all', 'any', 'both',
    'more', 'most', 'other', 'very', 'just', 'really', 'much', 'too', 'also'
]);

export interface SimilarSeedResult {
    seed: Seed;
    similarity: number;
}

export class SimilarityService {
    /**
     * Extract significant keywords from text
     */
    extractKeywords(text: string): Set<string> {
        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/) // Split by whitespace
            .filter(word => word.length > 2) // Filter short words
            .filter(word => !STOPWORDS.has(word)); // Filter stopwords

        return new Set(words);
    }

    /**
     * Calculate Jaccard similarity index between two sets of keywords
     */
    calculateSimilarity(setA: Set<string>, setB: Set<string>): number {
        if (setA.size === 0 || setB.size === 0) return 0;

        const intersection = new Set([...setA].filter(x => setB.has(x)));
        const union = new Set([...setA, ...setB]);

        return intersection.size / union.size;
    }

    /**
     * Find existing seeds that are similar to a new title
     */
    async findSimilarSeeds(
        userId: string,
        title: string,
        threshold: number = 0.25
    ): Promise<SimilarSeedResult[]> {
        const inputKeywords = this.extractKeywords(title);
        if (inputKeywords.size === 0) return [];

        // Fetch all active seeds for the user
        // In a massive app, we'd use vector search, but for high-quality small gardens, this is fine
        const activeSeeds = await prisma.seed.findMany({
            where: {
                userId,
                status: 'ACTIVE',
            },
        });

        const results: SimilarSeedResult[] = [];

        for (const seed of activeSeeds) {
            const seedKeywords = this.extractKeywords(seed.title);
            const similarity = this.calculateSimilarity(inputKeywords, seedKeywords);

            if (similarity >= threshold) {
                results.push({
                    seed: seed as unknown as Seed,
                    similarity,
                });
            }
        }

        // Sort by similarity descending
        return results.sort((a, b) => b.similarity - a.similarity);
    }
}
