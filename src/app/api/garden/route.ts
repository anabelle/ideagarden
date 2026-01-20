/**
 * 🌱 Idea Garden - Garden API Route
 * 
 * GET /api/garden - Get the full garden state for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { garden } from '@/lib/services';
import type { GardenOverview } from '@/types';

// TODO: Replace with real auth in Task 2.8
async function getUserId(request: NextRequest): Promise<string | null> {
    // Temporary: Read from header or query param for testing
    const userId = request.headers.get('x-user-id')
        || request.nextUrl.searchParams.get('userId');
    return userId;
}

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
        const userId = await getUserId(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized: User ID required' },
                { status: 401 }
            );
        }

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
