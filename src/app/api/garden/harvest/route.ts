/**
 * 🌱 Idea Garden - Harvest Seed API Route
 * 
 * POST /api/garden/harvest - Harvest a mature seed (5+ waterings)
 */

import { NextRequest, NextResponse } from 'next/server';
import { garden } from '@/lib/services';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth-middleware';

interface HarvestRequest {
    seedId: string;
}

/**
 * POST /api/garden/harvest
 * 
 * Request body:
 * {
 *   "seedId": "uuid-of-seed"
 * }
 * 
 * Returns:
 * - The harvested seed with status HARVESTED
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request);

        if (isAuthError(authResult)) {
            return authResult.error;
        }

        const userId = authResult.userId;

        // Parse and validate request body
        let body: HarvestRequest;
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

        // Harvest the seed
        const harvestedSeed = await garden.harvest(userId, body.seedId);

        return NextResponse.json({
            seed: harvestedSeed,
            xpEarned: 50, // XP_HARVEST constant
            message: '🎉 Congratulations! Your idea has been harvested!'
        }, { status: 200 });
    } catch (error) {
        console.error('[API] POST /api/garden/harvest error:', error);

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message === 'Seed not found') {
                return NextResponse.json(
                    { error: 'Seed not found' },
                    { status: 404 }
                );
            }
            if (error.message.includes('not mature enough')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                );
            }
            if (error.message.includes('already harvested')) {
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
