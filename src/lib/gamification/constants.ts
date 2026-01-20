import { Achievement } from '@/types';

export const ACHIEVEMENTS: Omit<Achievement, 'id' | 'condition'>[] = [
    {
        name: 'First Spark',
        description: 'Planted your very first idea.',
        icon: '🌱',
        xpReward: 50,
    },
    {
        name: 'Dedicated Gardner',
        description: 'Watered seeds 10 times.',
        icon: '💧',
        xpReward: 100,
    },
    {
        name: 'First Harvest',
        description: 'Harvested your first mature idea.',
        icon: '🌾',
        xpReward: 200,
    },
    {
        name: 'Idea Machine',
        description: 'Have 5 active seeds growing at once.',
        icon: '🧠',
        xpReward: 150,
    },
    {
        name: 'Compost Master',
        description: 'Discarded an idea. Letting go is growth.',
        icon: '🍂',
        xpReward: 30,
    },
    {
        name: 'Week Long Streak',
        description: 'Visited the garden 7 days in a row.',
        icon: '🔥',
        xpReward: 300,
    }
];

export const ACHIEVEMENT_IDS = {
    FIRST_SPARK: 'first-spark',
    DEDICATED_GARDNER: 'dedicated-gardner',
    FIRST_HARVEST: 'first-harvest',
    IDEA_MACHINE: 'idea-machine',
    COMPOST_MASTER: 'compost-master',
    WEEK_STREAK: 'week-streak'
};

// Map logical IDs to names for easy lookup
export const ACHIEVEMENT_LOOKUP: Record<string, typeof ACHIEVEMENTS[0]> = {
    [ACHIEVEMENT_IDS.FIRST_SPARK]: ACHIEVEMENTS[0],
    [ACHIEVEMENT_IDS.DEDICATED_GARDNER]: ACHIEVEMENTS[1],
    [ACHIEVEMENT_IDS.FIRST_HARVEST]: ACHIEVEMENTS[2],
    [ACHIEVEMENT_IDS.IDEA_MACHINE]: ACHIEVEMENTS[3],
    [ACHIEVEMENT_IDS.COMPOST_MASTER]: ACHIEVEMENTS[4],
    [ACHIEVEMENT_IDS.WEEK_STREAK]: ACHIEVEMENTS[5],
};
