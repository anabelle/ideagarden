import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';

interface ExperienceBarProps {
    xp: number;
    level: number;
}

export function ExperienceBar({ xp, level }: ExperienceBarProps) {
    // Level formula: level = floor(sqrt(xp/10)) + 1
    // Reverse: xp = (level-1)^2 * 10

    // Calculate progress to next level
    const currentLevelBaseXP = Math.pow(level - 1, 2) * 10;
    const nextLevelXP = Math.pow(level, 2) * 10;
    const xpNeededForLevel = nextLevelXP - currentLevelBaseXP;
    const xpInThisLevel = xp - currentLevelBaseXP;

    const progressPercent = Math.min(100, Math.max(0, (xpInThisLevel / xpNeededForLevel) * 100));

    return (
        <div className="glass-card mb-4 flex items-center gap-4 p-4">
            {/* Level Badge */}
            <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/20">
                <span className="text-xl font-bold text-white drop-shadow-md">{level}</span>
                <div className="absolute -bottom-1 -right-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white ring-1 ring-white/20">
                    LVL
                </div>
            </div>

            <div className="flex-1">
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-white flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-400" />
                        Master Gardener
                    </span>
                    <span className="text-gray-400">
                        {Math.floor(xpInThisLevel)} / {xpNeededForLevel} XP
                    </span>
                </div>

                {/* Progress Bar Container */}
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10 checkbox-inner-shadow">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 skeleton opacity-10" />

                    {/* Fill */}
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    >
                        {/* Shine effect */}
                        <div className="absolute top-0 right-0 bottom-0 w-[20px] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" />
                    </motion.div>
                </div>

                <div className="mt-1 flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>Current Rank</span>
                    <span>Next Rank: {nextLevelXP - xp} XP</span>
                </div>
            </div>
        </div>
    );
}
