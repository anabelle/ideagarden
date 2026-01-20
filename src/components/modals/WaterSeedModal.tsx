'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Droplets, RefreshCw } from 'lucide-react';
import type { Seed } from '@/types';
import { useSWRConfig } from 'swr';
import { notifyGardenUpdate } from '@/lib/hooks/useGarden';

interface WaterSeedModalProps {
    isOpen: boolean;
    onClose: () => void;
    seed: Seed | null;
    userId: string;
}

const WATERING_PROMPTS = [
    "What new insight did you have about this?",
    "How does this solve a real problem?",
    "What is the biggest risk here?",
    "Who is the ideal user for this?",
    "Is there a simpler version of this?",
    "What makes this unique?",
    "What's one small step to move this forward?",
    "What feedback have you received?",
];

export function WaterSeedModal({ isOpen, onClose, seed, userId }: WaterSeedModalProps) {
    const { mutate } = useSWRConfig();

    // Form State
    const [content, setContent] = useState('');
    const [promptIndex, setPromptIndex] = useState(0);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setContent('');
            setError(null);
            setSuccess(false);
            setPromptIndex(Math.floor(Math.random() * WATERING_PROMPTS.length));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!seed || !content.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/garden/water?userId=${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seedId: seed.id,
                    content
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to water seed');
            }

            // Success!
            setSuccess(true);

            // Refresh garden data locally
            mutate((key) => typeof key === 'string' && key.startsWith('/api/garden'));

            // Notify other tabs
            notifyGardenUpdate();

            // Close after animation
            setTimeout(() => {
                onClose();
            }, 1200);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsLoading(false);
        }
    };

    const nextPrompt = () => {
        setPromptIndex((prev) => (prev + 1) % WATERING_PROMPTS.length);
    };

    return (
        <AnimatePresence>
            {isOpen && seed && (
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
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-blue-400 font-medium mb-1">
                                        <Droplets className="h-4 w-4" />
                                        Watering Session
                                    </div>
                                    <h2 className="text-xl font-bold text-white line-clamp-1">
                                        {seed.title}
                                    </h2>
                                </div>
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
                                    <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in relative">
                                        {/* Water Drop Animation */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="h-4 w-4 rounded-full bg-blue-400 animate-water-drop"></div>
                                            <div className="absolute h-10 w-10 rounded-full border-2 border-blue-400/50 animate-water-ripple"></div>
                                        </div>

                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40 z-10">
                                            <Droplets className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white z-10">Seed Watered!</h3>
                                        <p className="text-gray-400 z-10">
                                            Growth progress: {seed.waterings} → {seed.waterings + 1}
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                        {/* Prompt Generator */}
                                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                                            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
                                                <span>Thinking Prompt</span>
                                                <button
                                                    type="button"
                                                    onClick={nextPrompt}
                                                    className="flex items-center gap-1 hover:text-blue-300 transition-colors"
                                                >
                                                    <RefreshCw className="h-3 w-3" />
                                                    Shuffle
                                                </button>
                                            </div>
                                            <p className="text-blue-100 italic">
                                                "{WATERING_PROMPTS[promptIndex]}"
                                            </p>
                                        </div>

                                        {/* Content Input */}
                                        <div className="space-y-2">
                                            <label htmlFor="content" className="text-sm font-medium text-gray-400">
                                                Your Thoughts
                                            </label>
                                            <textarea
                                                id="content"
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                placeholder="Write your new insight here..."
                                                rows={5}
                                                className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                                autoFocus
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
                                                disabled={!content.trim() || isLoading}
                                                className="btn bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none hover:shadow-glow-blue"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Watering...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Droplets className="h-4 w-4" />
                                                        Water Seed
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

export default WaterSeedModal;
