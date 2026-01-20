'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Sprout,
    Plus,
    Search,
    User,
    TrendingUp,
    LayoutDashboard,
    Menu,
    X,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🌱 Navigation Component
 * 
 * Main app navigation with glassmorphism effects.
 */
export function Navigation() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Garden', href: '/garden', icon: LayoutDashboard },
        { name: 'Analytics', href: '/analytics', icon: TrendingUp },
        { name: 'Merge', href: '/garden/consolidate', icon: Sparkles },
    ];

    const currentPath = pathname || '/';

    return (
        <nav className="sticky top-0 z-[200] w-full px-6 py-4">
            <div className="mx-auto max-w-7xl">
                <div className="glass-card flex items-center justify-between px-6 py-3 !rounded-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-cyan-500 shadow-glow-green group-hover:scale-110 transition-transform">
                            <Sprout className="h-6 w-6 text-black" />
                        </div>
                        <span className="hidden font-sans text-xl font-bold tracking-tight text-white sm:block">
                            Idea Garden
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-1 md:flex">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = currentPath === link.href;

                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${isActive
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors md:flex">
                            <Search className="h-5 w-5 text-gray-400" />
                        </button>

                        <Link
                            href="/garden?action=plant"
                            className="btn btn--primary flex h-10 items-center gap-2 px-4 !rounded-full sm:px-6"
                        >
                            <Plus className="h-5 w-5" />
                            <span className="hidden sm:inline">Plant Idea</span>
                        </Link>

                        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <User className="h-5 w-5 text-white" />
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute left-6 right-6 top-24 z-[190] md:hidden"
                    >
                        <div className="glass-card flex flex-col gap-2 p-4">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = currentPath === link.href;

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 rounded-xl p-4 text-base font-medium transition-all ${isActive
                                            ? 'bg-white/10 text-white'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {link.name}
                                    </Link>
                                );
                            })}
                            <hr className="my-2 border-white/5" />
                            <button className="flex items-center gap-3 rounded-xl p-4 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white">
                                <Search className="h-5 w-5" />
                                Search
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export default Navigation;
