'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { Seed } from '@/types';
import { SeedDetailView } from '@/components/garden/SeedDetailView';

// Fetcher
const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
});

interface SeedDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    seedId: string | null;
    initialSeed?: Seed | null;
    userId: string;
    onWater: (id: string) => void;
    onHarvest: (id: string) => void;
    onCompost: (id: string) => void;
}

export function SeedDetailModal({
    isOpen,
    onClose,
    seedId,
    initialSeed,
    userId,
    onWater,
    onHarvest,
    onCompost
}: SeedDetailModalProps) {
    // Only fetch if we have an ID and it's open
    const shouldFetch = isOpen && seedId;
    const { data: fetchedSeed, error, isLoading } = useSWR<Seed>(
        shouldFetch ? `/api/garden/${seedId}?userId=${userId}` : null,
        fetcher
    );

    // Use fetched seed if available, otherwise fallback to initialSeed
    const seed = fetchedSeed || initialSeed;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Side Panel / Modal */}
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed right-0 top-0 z-[260] h-full w-full max-w-2xl border-l border-white/10 bg-[#0a0f18]/95 shadow-2xl backdrop-blur-xl md:w-[600px]"
                    >
                        {/* Close Button - absolute top right */}
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 z-10 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="h-full p-8 pt-16">
                            {isLoading && !seed ? (
                                <div className="flex h-full flex-col items-center justify-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-seed-green" />
                                    <p className="mt-4 text-gray-500">Retrieving seed...</p>
                                </div>
                            ) : error ? (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <h3 className="text-xl font-bold text-red-400">Error loading seed</h3>
                                    <p className="text-gray-500 mt-2">Could not load details.</p>
                                    <button
                                        onClick={onClose}
                                        className="btn mt-4 bg-white/10"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : seed ? (
                                <SeedDetailView
                                    seed={seed}
                                    onWater={() => onWater(seed.id)}
                                    onHarvest={() => onHarvest(seed.id)}
                                    onCompost={() => onCompost(seed.id)}
                                />
                            ) : null}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
