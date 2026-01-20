/**
 * 🌱 Idea Garden - Water Seed API Route
 * 
 * POST /api/garden/water - Add new thoughts to a seed
 */

import { NextRequest, NextResponse } from 'next/server';
import { garden } from '@/lib/services';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth-middleware';
import type { WaterSeedRequest } from '@/types';

/**
 * POST /api/garden/water
 * 
 * Request body:
 * {
 *   "seedId": "uuid-of-seed",
 *   "content": "New thoughts about this idea..."
 * }
 * 
 * Returns:
 * - { seed, promoted, newSection?, xpEarned }
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request);

        if (isAuthError(authResult)) {
            return authResult.error;
        }

        const userId = authResult.userId;

        // Parse and validate request body
        let body: WaterSeedRequest;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        if (!body.seedId || typeof body.seedId !== 'string') {
            return NextResponse.json(
                { error: 'seedId is required and must be a string' },
                { status: 400 }
            );
        }

        if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
            return NextResponse.json(
                { error: 'content is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // Water the seed
        const result = await garden.water(userId, body.seedId, body.content.trim());

        return NextResponse.json({
            seed: result.seed,
            promoted: result.promoted,
            newSection: result.newSection,
            xpEarned: 5 // XP_WATER constant
        }, { status: 200 });
    } catch (error) {
        console.error('[API] POST /api/garden/water error:', error);

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message === 'Seed not found') {
                return NextResponse.json(
                    { error: 'Seed not found' },
                    { status: 404 }
                );
            }
            if (error.message.includes('Cannot water')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
