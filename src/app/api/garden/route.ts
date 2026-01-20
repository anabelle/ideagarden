/**
 * 🌱 Idea Garden - Garden API Route
 * 
 * GET /api/garden - Get the full garden state for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { garden } from '@/lib/services';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth-middleware';
import type { GardenOverview } from '@/types';

/**
 * GET /api/garden
 * 
 * Returns the full garden state organized by sections:
 * - seeds: New ideas (0-2 waterings)
 * - sprouting: Growing ideas (3-4 waterings)
 * - readyToHarvest: Mature ideas (5+ waterings)
 * - composted: Discarded/harvested ideas
 * 
 * Also includes aggregate stats.
 */
export async function GET(request: NextRequest): Promise<NextResponse<GardenOverview | { error: string }>> {
    try {
        const authResult = await getAuthenticatedUser(request);

        if (isAuthError(authResult)) {
            return authResult.error;
        }

        const userId = authResult.userId;
        const gardenState = await garden.getGarden(userId);

        return NextResponse.json(gardenState, { status: 200 });
    } catch (error) {
        console.error('[API] GET /api/garden error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
