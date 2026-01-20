'use client';

import React from 'react';
import { useGarden } from '@/lib/hooks/useGarden';
import { GardenSection } from '@/components/garden/GardenSection';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

// Temporary test user ID until Auth UI is ready
const TEST_USER_ID = 'dev-user-123';

export default function GardenPage() {
    const { garden, isLoading, isError } = useGarden(TEST_USER_ID);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-seed-green" />
                <p className="mt-4 text-gray-400">Walking to the garden...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="glass-card max-w-md p-8">
                    <h2 className="text-xl font-bold text-red-400">Something went wrong</h2>
                    <p className="mt-2 text-gray-400">We couldn't load your garden. Please try again later.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn mt-4 bg-white/10 hover:bg-white/20"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    if (!garden) return null;

    const sections = [
        {
            title: 'Seeds',
            icon: '🌱',
            seeds: garden.seeds,
            emptyMessage: "No seeds yet! Capture an idea to get started.",
            accentColor: '#4ade80', // seed-green
        },
        {
            title: 'Sprouting',
            icon: '🌿',
            seeds: garden.sprouting,
            emptyMessage: "Keep watering your seeds to see them sprout!",
            accentColor: '#22d3ee', // sprout-teal
        },
        {
            title: 'Ready to Harvest',
            icon: '🌸',
            seeds: garden.readyToHarvest,
            emptyMessage: "Great ideas take time. Keep nurturing!",
            accentColor: '#fbbf24', // harvest-gold
        },
        {
            title: 'Compost',
            icon: '🍂',
            seeds: garden.composted,
            emptyMessage: "Compost is empty. Nothing wasted yet!",
            accentColor: '#a78bfa', // compost-purple
        },
    ];

    // Handlers (placeholder for now, will be connected in Phase 4)
    const handleWater = (id: string) => console.log('Water', id);
    const handleHarvest = (id: string) => console.log('Harvest', id);
    const handleCompost = (id: string) => console.log('Compost', id);
    const handleSelect = (id: string) => console.log('Select', id);

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
                        My Garden
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Nurturing {garden.stats.totalSeeds} ideas with {garden.stats.totalWaterings} waterings.
                    </p>
                </div>

                <Link
                    href="/garden/plant"
                    className="btn btn--primary group"
                >
                    <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    Plant New Idea
                </Link>
            </div>

            {/* Garden Stats Bar */}
            <div className="glass-card mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{garden.stats.totalSeeds}</div>
                    <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Active Ideas</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{garden.stats.totalWaterings}</div>
                    <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Thoughts</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">{garden.stats.totalHarvested}</div>
                    <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Harvested</div>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-500">
                        {garden.stats.currentStreak} <span className="text-lg">🔥</span>
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Day Streak</div>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
                {sections.map((section) => (
                    <GardenSection
                        key={section.title}
                        {...section}
                        onWater={handleWater}
                        onHarvest={handleHarvest}
                        onCompost={handleCompost}
                        onSelect={handleSelect}
                    />
                ))}
            </div>
        </div>
    );
}
