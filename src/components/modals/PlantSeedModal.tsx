'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, AlertTriangle, ArrowRight, Sprout } from 'lucide-react';
import type { SimilarSeedResult } from '@/types';
import { useSWRConfig } from 'swr';
import { notifyGardenUpdate } from '@/lib/hooks/useGarden';

interface PlantSeedModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string; // Temporary integration until real auth context
}

export function PlantSeedModal({ isOpen, onClose, userId }: PlantSeedModalProps) {
    const { mutate } = useSWRConfig();

    // Form State
    const [title, setTitle] = useState('');
    const [origin, setOrigin] = useState('');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [similarSeeds, setSimilarSeeds] = useState<SimilarSeedResult[]>([]);
    const [blocked, setBlocked] = useState(false);
    const [success, setSuccess] = useState(false);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setOrigin('');
            setError(null);
            setSimilarSeeds([]);
            setBlocked(false);
            setSuccess(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !origin.trim()) return;

        setIsLoading(true);
        setError(null);
        setSimilarSeeds([]);
        setBlocked(false);

        try {
            // Using userId query param for temp dev auth
            const res = await fetch(`/api/garden/plant?userId=${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, origin }),
            });

            const data = await res.json();

            // Handle Similarity Block/Warning (409 Conflict)
            if (res.status === 409) {
                setSimilarSeeds(data.similarSeeds || []);
                setBlocked(true); // Technically blocked, but we might allow override if not strict
                setIsLoading(false);
                return;
            }

            if (!res.ok) {
                throw new Error(data.error || 'Failed to plant seed');
            }

            // Success!
            setSuccess(true);

            // Refresh garden data locally
            mutate((key) => typeof key === 'string' && key.startsWith('/api/garden'));

            // Notify other tabs
            notifyGardenUpdate();

            // Close after simple animation delay
            setTimeout(() => {
                onClose();
            }, 1000); // 1s to show success

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            // Only stop loading if we didn't succeed (so we can show success state)
            // or if we didn't get blocked (handled above)
            if (!success && !blocked) {
                setIsLoading(false);
            }
        }
    };

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
                        className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-[310] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
                    >
                        <div className="glass-card relative overflow-hidden p-0">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/10 p-6">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                                        <Sprout className="h-5 w-5" />
                                    </span>
                                    Plant New Idea
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                {success ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400 ring-1 ring-green-500/40">
                                            <Sprout className="h-8 w-8 animate-plant" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Seed Planted!</h3>
                                        <p className="text-gray-400">Your idea has taken root.</p>
                                    </div>
                                ) : blocked ? (
                                    <div className="flex flex-col gap-4 animate-fade-in">
                                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                                            <div className="flex items-center gap-3 text-yellow-500">
                                                <AlertTriangle className="h-5 w-5" />
                                                <h4 className="font-bold">Wait! Similar ideas found.</h4>
                                            </div>
                                            <p className="mt-2 text-sm text-yellow-200/80">
                                                We found existing seeds that look very similar to this one.
                                                Instead of planting a duplicate, consider watering one of these:
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                                            {similarSeeds.map((match) => (
                                                <div
                                                    key={match.seed.id}
                                                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 hover:border-green-500/30 hover:bg-white/10 transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        onClose();
                                                        // TODO: Navigate to that seed/open water modal
                                                        console.log('Navigate to:', match.seed.id);
                                                    }}
                                                >
                                                    <div>
                                                        <h5 className="font-medium text-white">{match.seed.title}</h5>
                                                        <span className="text-xs text-green-400">
                                                            {Math.round(match.similarity * 100)}% Match
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="h-5 w-5 text-gray-500" />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 flex justify-end gap-3">
                                            <button
                                                onClick={() => setBlocked(false)}
                                                className="btn text-sm"
                                            >
                                                Edit My Idea
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                        {/* Title Input */}
                                        <div className="space-y-2">
                                            <label htmlFor="title" className="text-sm font-medium text-gray-400">
                                                What is your idea?
                                            </label>
                                            <input
                                                id="title"
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g. A social network for cats"
                                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/50"
                                                autoFocus
                                            />
                                        </div>

                                        {/* Origin Input */}
                                        <div className="space-y-2">
                                            <label htmlFor="origin" className="text-sm font-medium text-gray-400">
                                                Initial thought (The Origin)
                                            </label>
                                            <textarea
                                                id="origin"
                                                value={origin}
                                                onChange={(e) => setOrigin(e.target.value)}
                                                placeholder="What sparked this? Why is it interesting?"
                                                rows={4}
                                                className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/50"
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                                {error}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="btn bg-transparent hover:bg-white/5"
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!title || !origin || isLoading}
                                                className="btn btn--primary"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Planting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sprout className="h-4 w-4" />
                                                        Plant Seed
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default PlantSeedModal;
