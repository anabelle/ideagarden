
import prisma from '@/lib/db/prisma';
import { ACHIEVEMENT_IDS, ACHIEVEMENT_LOOKUP } from '@/lib/gamification/constants';

export class AchievementService {
    /**
     * Check all achievements for a user and unlock any new ones.
     * Returns a list of newly unlocked achievements.
     */
    async checkAchievements(userId: string): Promise<string[]> {
        const unlocked: string[] = [];

        // 1. Fetch current stats via Prisma
        const allSeeds = await prisma.seed.findMany({ where: { userId } });
        const streak = await prisma.streak.findUnique({ where: { userId } });

        const totalSeeds = allSeeds.length;
        // Approximation: sum of waterings on seeds
        const totalWaterings = allSeeds.reduce((sum, s) => sum + s.waterings, 0);
        const totalHarvested = allSeeds.filter(s => s.status === 'HARVESTED').length;
        const totalComposted = allSeeds.filter(s => s.status === 'COMPOSTED').length;
        const activeSeedsCount = allSeeds.filter(s => s.status === 'ACTIVE').length;
        const currentStreak = streak?.currentStreak ?? 0;

        // 2. Fetch already unlocked achievements
        const existingUnlocks = await prisma.userAchievement.findMany({
            where: { userId },
            select: { achievementId: true }
        });
        const existingIds = new Set(existingUnlocks.map(u => u.achievementId));

        // 3. Define checks
        const checks = [
            {
                id: ACHIEVEMENT_IDS.FIRST_SPARK,
                condition: () => totalSeeds >= 1
            },
            {
                id: ACHIEVEMENT_IDS.DEDICATED_GARDNER,
                condition: () => totalWaterings >= 10
            },
            {
                id: ACHIEVEMENT_IDS.FIRST_HARVEST,
                condition: () => totalHarvested >= 1
            },
            {
                id: ACHIEVEMENT_IDS.IDEA_MACHINE,
                condition: () => activeSeedsCount >= 5
            },
            {
                id: ACHIEVEMENT_IDS.COMPOST_MASTER,
                condition: () => totalComposted >= 1
            },
            {
                id: ACHIEVEMENT_IDS.WEEK_STREAK,
                condition: () => currentStreak >= 7
            }
        ];

        // 4. Run checks
        for (const check of checks) {
            // Find the database ID for this achievement name
            // Note: In our seed script, we used the name as the key, but Prisma generates CUIDs if we didn't force it.
            // Wait, in seed script we matched by name. We need to find the DB ID by name.

            const achievementDef = ACHIEVEMENT_LOOKUP[check.id];
            if (!achievementDef) continue;

            const dbAchievement = await prisma.achievement.findUnique({
                where: { name: achievementDef.name }
            });

            if (!dbAchievement) continue;

            if (existingIds.has(dbAchievement.id)) continue;

            if (check.condition()) {
                await this.unlock(userId, dbAchievement.id, dbAchievement.xpReward);
                unlocked.push(dbAchievement.name);
            }
        }

        return unlocked;
    }

    private async unlock(userId: string, achievementId: string, xpReward: number) {
        await prisma.userAchievement.create({
            data: {
                userId,
                achievementId
            }
        });

        // Award XP
        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: { increment: xpReward }
            }
        });
    }
}
