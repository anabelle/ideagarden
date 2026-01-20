'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Seed } from '@/types';
import { Flower, Share2, ArrowRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HarvestCelebrationProps {
    seed: Seed | null;
    onClose: () => void;
}

export function HarvestCelebration({ seed, onClose }: HarvestCelebrationProps) {
    useEffect(() => {
        if (seed) {
            // Trigger confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#fbbf24', '#f59e0b', '#d97706', '#ec4899', '#8b5cf6']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#fbbf24', '#f59e0b', '#d97706', '#ec4899', '#8b5cf6']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [seed]);

    if (!seed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-1 shadow-2xl ring-1 ring-white/20"
                >
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-pink-500/20 opacity-50 blur-xl" />

                    <div className="relative flex flex-col items-center rounded-[22px] bg-[#0a0f18] p-8 text-center text-white">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-gray-500 hover:text-white"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30"
                        >
                            <Flower className="h-12 w-12 text-white" />
                        </motion.div>

                        <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-400">
                            Harvested!
                        </h2>

                        <p className="mb-6 text-gray-400">
                            Your idea has fully matured. Great work nurturing it!
                        </p>

                        <div className="mb-8 flex w-full flex-col gap-3 rounded-xl bg-white/5 p-4 border border-white/10">
                            <h3 className="text-xl font-bold text-white">{seed.title}</h3>
                            <div className="flex justify-center gap-6 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-gray-500">Waterings</span>
                                    <span className="font-mono text-lg font-bold text-blue-400">{seed.waterings}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500">XP Earned</span>
                                    <span className="font-mono text-lg font-bold text-green-400">
                                        +50
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500">Time Grown</span>
                                    <span className="font-mono text-lg font-bold text-purple-400">
                                        {formatDistanceToNow(new Date(seed.plantedAt))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full gap-3">
                            <button className="btn flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 flex-1">
                                <Share2 className="h-4 w-4" />
                                Share
                            </button>
                            <button
                                onClick={onClose}
                                className="btn btn--primary flex items-center justify-center gap-2 flex-1"
                            >
                                Continue
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
