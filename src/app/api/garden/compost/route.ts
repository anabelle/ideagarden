/**
 * 🌱 Idea Garden - Compost Seed API Route
 * 
 * POST /api/garden/compost - Discard a seed to the compost pile
 */

import { NextRequest, NextResponse } from 'next/server';
import { garden } from '@/lib/services';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth-middleware';

interface CompostRequest {
    seedId: string;
    reason?: string;
}

/**
 * POST /api/garden/compost
 * 
 * Request body:
 * {
 *   "seedId": "uuid-of-seed",
 *   "reason": "Optional reason for composting"
 * }
 * 
 * Returns:
 * - The composted seed
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request);

        if (isAuthError(authResult)) {
            return authResult.error;
        }

        const userId = authResult.userId;

        // Parse and validate request body
        let body: CompostRequest;
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

        // Compost the seed
        const compostedSeed = await garden.compost(
            userId,
            body.seedId,
            body.reason || 'No reason provided'
        );

        return NextResponse.json({
            seed: compostedSeed,
            message: '🍂 Seed has been composted. It may nourish future ideas!'
        }, { status: 200 });
    } catch (error) {
        console.error('[API] POST /api/garden/compost error:', error);

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message === 'Seed not found') {
                return NextResponse.json(
                    { error: 'Seed not found' },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
