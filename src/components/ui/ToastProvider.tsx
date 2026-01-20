'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { ACHIEVEMENT_LOOKUP } from '@/lib/gamification/constants';

interface ToastContextType {
    showAchievement: (achievementName: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [queue, setQueue] = useState<string[]>([]);
    const [current, setCurrent] = useState<string | null>(null);

    const showAchievement = (name: string) => {
        setQueue((prev) => [...prev, name]);
    };

    useEffect(() => {
        if (!current && queue.length > 0) {
            const next = queue[0];
            setCurrent(next);
            setQueue((prev) => prev.slice(1));

            // Auto dismiss after 4s
            setTimeout(() => {
                setCurrent(null);
            }, 4000);
        }
    }, [queue, current]);

    // Find achievement details (reverse lookup or passed full object? Name is usually unique)
    // In our constants, we keyed by ID but stored Name. 
    // We need to look up by Name.
    const details = Object.values(ACHIEVEMENT_LOOKUP).find(a => a.name === current);

    return (
        <ToastContext.Provider value={{ showAchievement }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
                <AnimatePresence mode="wait">
                    {current && (
                        <motion.div
                            key={current}
                            initial={{ x: 100, opacity: 0, scale: 0.8 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ x: 100, opacity: 0, scale: 0.8 }}
                            className="pointer-events-auto flex w-80 items-start gap-4 rounded-xl border border-yellow-500/30 bg-gray-900/90 p-4 shadow-2xl backdrop-blur-md"
                        >
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-2xl shadow-lg ring-2 ring-yellow-500/20">
                                {details?.icon || '🏆'}
                            </div>

                            <div className="flex-1">
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-yellow-500">
                                    <Trophy className="h-3 w-3" />
                                    Achievement Unlocked
                                </h4>
                                <h3 className="text-lg font-bold text-white">{current}</h3>
                                <p className="text-xs text-gray-300 mt-1">{details?.description}</p>
                                <div className="mt-2 text-xs font-mono text-yellow-400/80">
                                    +{details?.xpReward || 0} XP
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
