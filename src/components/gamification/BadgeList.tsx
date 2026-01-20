import React from 'react';
import { ACHIEVEMENTS } from '@/lib/gamification/constants';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface BadgeListProps {
    unlockedNames: string[];
}

export function BadgeList({ unlockedNames }: BadgeListProps) {
    const unlockedSet = new Set(unlockedNames);

    return (
        <div className="glass-card p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Achievements</h3>
            <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
                {ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = unlockedSet.has(achievement.name);

                    return (
                        <div
                            key={achievement.name}
                            className={`group relative flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${isUnlocked
                                    ? 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10'
                                    : 'border-white/5 bg-white/5 opacity-50 grayscale'
                                }`}
                        >
                            <div className="mb-2 text-2xl">
                                {isUnlocked ? achievement.icon : <span className="opacity-50">🔒</span>}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                {achievement.name}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 scale-0 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 border border-white/10 bg-gray-900 p-2 text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                                <p className="font-bold text-yellow-500 mb-1">{achievement.name}</p>
                                <p className="text-gray-300">{achievement.description}</p>
                                <p className="mt-1 text-green-400 font-mono">+{achievement.xpReward} XP</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
