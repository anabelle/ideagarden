/**
 * 🌱 Idea Garden - Auth API Route
 * 
 * Handles all NextAuth.js routes: /api/auth/*
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
