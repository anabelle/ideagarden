import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Seed } from '@/types';
import { BarChart, TrendingUp, Calendar, Disc } from 'lucide-react';

interface StatsPanelProps {
    seeds: Seed[];
    sprouting: Seed[];
    readyToHarvest: Seed[];
    composted: Seed[];
    harvestedCount: number;
}

export function StatsPanel({ seeds, sprouting, readyToHarvest, composted, harvestedCount }: StatsPanelProps) {
    // 1. Calculate Distribution
    const distribution = useMemo(() => {
        const total = seeds.length + sprouting.length + readyToHarvest.length + composted.length + harvestedCount;
        if (total === 0) return [];

        return [
            { label: 'Seeds', count: seeds.length, color: 'bg-green-400', percent: (seeds.length / total) * 100 },
            { label: 'Sprouting', count: sprouting.length, color: 'bg-cyan-400', percent: (sprouting.length / total) * 100 },
            { label: 'Harvested', count: harvestedCount, color: 'bg-yellow-400', percent: (harvestedCount / total) * 100 },
            { label: 'Composted', count: composted.length, color: 'bg-purple-400', percent: (composted.length / total) * 100 },
        ].filter(d => d.count > 0);
    }, [seeds, sprouting, readyToHarvest, composted, harvestedCount]);

    // 2. Simple Activity Mock (Since we don't have full logs, we use current seeds updatedAt)
    // In a real app, we'd fetch a separate /api/stats endpoint for daily activity history

    return (
        <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase tracking-wider text-xs font-bold">
                <BarChart className="h-4 w-4" />
                Garden Analytics
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Distribution Bar */}
                <div>
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Disc className="h-4 w-4 text-blue-400" />
                        Ecosystem Balance
                    </h4>
                    <div className="space-y-4">
                        {distribution.map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-300">{item.label}</span>
                                    <span className="text-gray-500">{Math.round(item.percent)}% ({item.count})</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${item.color}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insights / Productivity */}
                <div>
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        Insights
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                            <div className="text-xs text-gray-500 uppercase">Conversion Rate</div>
                            <div className="text-2xl font-bold text-white mt-1">
                                {seeds.length > 0 ? Math.round((harvestedCount / (seeds.length + harvestedCount + composted.length)) * 100) : 0}%
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">Ideas harvested</div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                            <div className="text-xs text-gray-500 uppercase">Active Thoughts</div>
                            <div className="text-2xl font-bold text-blue-400 mt-1">
                                {seeds.length + sprouting.length + readyToHarvest.length}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">Growing now</div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/5 col-span-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase mb-2">
                                <Calendar className="h-3 w-3" />
                                Garden Health
                            </div>
                            <p className="text-sm text-gray-300">
                                Your garden is {harvestedCount > composted.length ? 'thriving' : 'developing'}.
                                Keep watering your seeds to see more sprouts!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
