'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGarden } from '@/lib/hooks/useGarden';
import { GardenSection } from '@/components/garden/GardenSection';
import { PlantSeedModal } from '@/components/modals/PlantSeedModal';
import { WaterSeedModal } from '@/components/modals/WaterSeedModal';
import { SeedDetailModal } from '@/components/modals/SeedDetailModal';
import { Loader2, Plus } from 'lucide-react';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import Link from 'next/link';
import { HarvestCelebration } from '@/components/garden/HarvestCelebration';
import { useSWRConfig } from 'swr';
import { notifyGardenUpdate } from '@/lib/hooks/useGarden';
import { ExperienceBar } from '@/components/gamification/ExperienceBar';
import { BadgeList } from '@/components/gamification/BadgeList';
import { StatsPanel } from '@/components/gamification/StatsPanel';
import { useToast } from '@/components/ui/ToastProvider';
import type { Seed } from '@/types';

// Temporary test user ID until Auth UI is ready
const TEST_USER_ID = 'dev-user-123';

function GardenContent() {
    const { garden, isLoading, isError } = useGarden(TEST_USER_ID);
    const { mutate } = useSWRConfig();
    const { showAchievement } = useToast();
    const searchParams = useSearchParams();

    // Modal State
    const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
    const [selectedSeedForWatering, setSelectedSeedForWatering] = useState<Seed | null>(null);
    const [selectedSeedIdForDetail, setSelectedSeedIdForDetail] = useState<string | null>(null);
    const [harvestedSeed, setHarvestedSeed] = useState<Seed | null>(null);

    // Keyboard Shortcuts
    useKeyboardShortcuts({
        'n': (e) => {
            e.preventDefault();
            setIsPlantModalOpen(true);
        },
        'Escape': () => {
            setIsPlantModalOpen(false);
            setSelectedSeedForWatering(null);
            setSelectedSeedIdForDetail(null);
            // Don't close harvest celebration on escape immediately to let them enjoy it? 
            // Or yes, for consistency.
            setHarvestedSeed(null);
        }
    });

    // Check for query params to open modal (e.g. from Navigation)
    useEffect(() => {
        if (searchParams.get('action') === 'plant') {
            setIsPlantModalOpen(true);
        }
    }, [searchParams]);

    // Cleanup URL when closing modal
    const closePlantModal = () => {
        setIsPlantModalOpen(false);
        // Remove query param without refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    };

    // Find seed by ID helper
    const findSeed = (id: string) => {
        if (!garden) return null;
        return [
            ...garden.seeds,
            ...garden.sprouting,
            ...garden.readyToHarvest,
            ...garden.composted
        ].find(s => s.id === id) || null;
    };

    // Handlers
    const handleWater = (id: string) => {
        const seed = findSeed(id);
        if (seed) setSelectedSeedForWatering(seed);
    };

    const handleHarvest = async (id: string) => {
        try {
            const res = await fetch('/api/garden/harvest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seedId: id }),
            });

            if (!res.ok) throw new Error('Failed to harvest');

            const data = await res.json();

            // Check achievements
            if (data.achievements) {
                data.achievements.forEach((a: string) => showAchievement(a));
            }

            // Close other modals
            setSelectedSeedIdForDetail(null);

            // Show celebration
            setHarvestedSeed(data.seed);

            // Refresh garden data
            mutate(`/api/garden?userId=${TEST_USER_ID}`);
            notifyGardenUpdate();
        } catch (error) {
            console.error('Harvest error:', error);
            // Optionally show toast error
        }
    };

    const handleCompost = (id: string) => console.log('Compost', id);
    const handleSelect = (id: string) => {
        setSelectedSeedIdForDetail(id);
    };

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

                <button
                    onClick={() => setIsPlantModalOpen(true)}
                    className="btn btn--primary group"
                >
                    <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    Plant New Idea
                </button>
            </div>

            {/* XP Bar */}
            <ExperienceBar
                xp={garden.stats.xp}
                level={garden.stats.level}
            />

            {/* Badges */}
            <div className="mb-8">
                <BadgeList unlockedNames={garden.stats.achievements} />
            </div>

            {/* Stats Panel */}
            <div className="mb-8">
                <StatsPanel
                    seeds={garden.seeds}
                    sprouting={garden.sprouting}
                    readyToHarvest={garden.readyToHarvest}
                    composted={garden.composted}
                    harvestedCount={garden.stats.totalHarvested}
                />
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

            {/* Modals */}
            <PlantSeedModal
                isOpen={isPlantModalOpen}
                onClose={closePlantModal}
                userId={TEST_USER_ID}
            />

            <WaterSeedModal
                isOpen={!!selectedSeedForWatering}
                onClose={() => setSelectedSeedForWatering(null)}
                seed={selectedSeedForWatering}
                userId={TEST_USER_ID}
            />

            <SeedDetailModal
                isOpen={!!selectedSeedIdForDetail}
                onClose={() => setSelectedSeedIdForDetail(null)}
                seedId={selectedSeedIdForDetail}
                initialSeed={selectedSeedIdForDetail ? findSeed(selectedSeedIdForDetail) : null}
                userId={TEST_USER_ID}
                onWater={handleWater}
                onHarvest={handleHarvest}
                onCompost={handleCompost}
            />

            <HarvestCelebration
                seed={harvestedSeed}
                onClose={() => setHarvestedSeed(null)}
            />
        </div>
    );
}

export default function GardenPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-seed-green" />
            </div>
        }>
            <GardenContent />
        </Suspense>
    );
}
