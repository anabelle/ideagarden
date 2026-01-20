'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SeedCard } from './SeedCard';
import type { Seed } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface GardenSectionProps {
    title: string;
    icon: string;
    seeds: Seed[];
    emptyMessage: string;
    accentColor: string; // e.g. "var(--seed-green)" or hex
    onWater?: (seedId: string) => void;
    onHarvest?: (seedId: string) => void;
    onCompost?: (seedId: string) => void;
    onSelect?: (seedId: string) => void;
    defaultExpanded?: boolean;
}

export function GardenSection({
    title,
    icon,
    seeds,
    emptyMessage,
    accentColor,
    onWater,
    onHarvest,
    onCompost,
    onSelect,
    defaultExpanded = true
}: GardenSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="mb-8 w-full">
            {/* Section Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between py-4 text-left group"
            >
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-xl group-hover:scale-110 transition-transform">
                        {icon}
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight text-white/90">
                        {title}
                        <span
                            className="ml-3 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                                backgroundColor: `${accentColor}20`, // 20 = ~12% opacity
                                color: accentColor,
                                border: `1px solid ${accentColor}40`
                            }}
                        >
                            {seeds.length}
                        </span>
                    </h2>
                </div>

                <div className="text-gray-500 transition-colors group-hover:text-white">
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
                </div>
            </button>

            {/* Section Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        variants={containerVariants}
                    >
                        {seeds.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {seeds.map((seed) => (
                                    <motion.div key={seed.id} variants={itemVariants}>
                                        <SeedCard
                                            seed={seed}
                                            onWater={onWater}
                                            onHarvest={onHarvest}
                                            onCompost={onCompost}
                                            onClick={onSelect}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-card flex min-h-[120px] flex-col items-center justify-center border-dashed border-white/10 bg-transparent text-center"
                            >
                                <p className="text-gray-500 mb-2">{emptyMessage}</p>
                                {title === 'Seeds' && (
                                    <span className="text-sm text-gray-600">
                                        Click "Plant Idea" to get started!
                                    </span>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default GardenSection;
