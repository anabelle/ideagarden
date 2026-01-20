/**
 * 🌱 Idea Garden - Utility Functions
 */

/**
 * Generate a random ID (for client-side use before Prisma)
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Calculate XP needed for next level
 */
export function xpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Calculate current level from total XP
 */
export function levelFromXp(xp: number): number {
    let level = 1;
    let xpNeeded = 100;
    let totalXpNeeded = 0;

    while (totalXpNeeded + xpNeeded <= xp) {
        totalXpNeeded += xpNeeded;
        level++;
        xpNeeded = xpForLevel(level);
    }

    return level;
}

/**
 * Tokenize a string for similarity comparison
 */
export function tokenize(text: string): Set<string> {
    return new Set(
        text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2)
    );
}

/**
 * Calculate Jaccard similarity between two sets
 */
export function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
