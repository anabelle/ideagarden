import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Seed, WateringLog } from '@/types';
import { Droplets, Sprout, Flower, Leaf, Calendar, User, GitMerge } from 'lucide-react';

interface SeedDetailViewProps {
    seed: Seed;
    onWater: () => void;
    onHarvest: () => void;
    onCompost: () => void;
}

export function SeedDetailView({ seed, onWater, onHarvest, onCompost }: SeedDetailViewProps) {
    const stageIcon = {
        SEEDS: <Sprout className="h-6 w-6 text-seed-green" />,
        SPROUTING: <Leaf className="h-6 w-6 text-sprout-teal" />,
        READY_TO_HARVEST: <Flower className="h-6 w-6 text-harvest-gold" />,
        COMPOST: <Leaf className="h-6 w-6 text-compost-amber" />, // Reuse leaf for compost but different color
        ACTIVE: <Sprout className="h-6 w-6" />, // Fallback
        HARVESTED: <Flower className="h-6 w-6" />, // Fallback
        COMPOSTED: <Leaf className="h-6 w-6" />, // Fallback
    } as any; /* eslint-disable-line @typescript-eslint/no-explicit-any */

    const getIcon = () => {
        // Try section first, then status
        return stageIcon[seed.section] || stageIcon[seed.status] || stageIcon.SEEDS;
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Header Info */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Planted {formatDistanceToNow(new Date(seed.plantedAt))} ago</span>
                    <span className="text-gray-600">•</span>
                    <span className="capitalize text-blue-400">{seed.section.replace(/_/g, ' ').toLowerCase()}</span>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4 leading-tight">{seed.title}</h2>

                <div className="glass-card p-4 bg-white/5 border-white/10">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">The Origin</h3>
                    <p className="text-lg text-gray-200 leading-relaxed font-serif italic">
                        "{seed.origin}"
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="glass-card p-3 flex flex-col items-center justify-center bg-blue-500/10 border-blue-500/20">
                    <span className="text-2xl font-bold text-blue-400">{seed.waterings}</span>
                    <span className="text-xs uppercase text-blue-300">Waterings</span>
                </div>
                <div className="glass-card p-3 flex flex-col items-center justify-center bg-green-500/10 border-green-500/20">
                    <span className="text-2xl font-bold text-green-400">
                        {Math.floor(seed.waterings * 5 + 10)}
                    </span>
                    <span className="text-xs uppercase text-green-300">XP Earned</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <GitMerge className="h-5 w-5 text-gray-400" />
                    Growth Timeline
                </h3>

                <div className="relative border-l-2 border-white/10 ml-3 space-y-8 pb-4">
                    {/* Reverse order logs (newest first) */}
                    {seed.logs?.map((log, index) => (
                        <div key={log.id} className="relative pl-8">
                            {/* Dot */}
                            <div className="absolute left-[-5px] top-2 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-black" />

                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(log.createdAt))} ago
                                </span>
                                <div className="glass-card p-3 bg-white/5 hover:bg-white/10 transition-colors">
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                                        {log.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Origin Node */}
                    <div className="relative pl-8 opacity-60">
                        <div className="absolute left-[-5px] top-2 h-3 w-3 rounded-full bg-green-500 ring-4 ring-black" />
                        <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(seed.plantedAt))} ago
                        </span>
                        <p className="text-gray-400 text-sm mt-1">Seed planted</p>
                    </div>
                </div>
            </div>

            {/* Actions Footer - Only for Active Seeds */}
            {seed.status === 'ACTIVE' && (
                <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-white/10">
                    <button
                        onClick={onWater}
                        className="btn flex-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/30 hover:border-blue-500/50"
                    >
                        <Droplets className="h-4 w-4" />
                        Water
                    </button>

                    {seed.section === 'READY_TO_HARVEST' && (
                        <button
                            onClick={onHarvest}
                            className="btn flex-1 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border-yellow-500/30 hover:border-yellow-500/50"
                        >
                            <Flower className="h-4 w-4" />
                            Harvest
                        </button>
                    )}

                    <button
                        onClick={onCompost}
                        className="btn px-3 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-red-400 border-white/10"
                        title="Compost this idea"
                    >
                        <Leaf className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
