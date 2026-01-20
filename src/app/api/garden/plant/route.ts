/**
 * 🌱 Idea Garden - Plant Seed API Route
 * 
 * POST /api/garden/plant - Plant a new seed (idea) in the garden
 */

import { NextRequest, NextResponse } from 'next/server';
import { garden } from '@/lib/services';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth-middleware';
import type { PlantSeedRequest } from '@/types';

/**
 * POST /api/garden/plant
 * 
 * Request body:
 * {
 *   "title": "My new idea",
 *   "origin": "shower thought"
 * }
 * 
 * Returns:
 * - On success: { seed, similarSeeds, blocked: false }
 * - On duplicate: { similarSeeds, blocked: true } with status 409
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request);

        if (isAuthError(authResult)) {
            return authResult.error;
        }

        const userId = authResult.userId;

        // Parse and validate request body
        let body: PlantSeedRequest;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
            return NextResponse.json(
                { error: 'Title is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        if (!body.origin || typeof body.origin !== 'string') {
            return NextResponse.json(
                { error: 'Origin is required and must be a string' },
                { status: 400 }
            );
        }

        // Plant the seed (will check for duplicates)
        const result = await garden.plant(userId, body.title.trim(), body.origin.trim());

        if (result.blocked) {
            return NextResponse.json(
                {
                    error: 'Similar seed already exists',
                    similarSeeds: result.similarSeeds,
                    blocked: true
                },
                { status: 409 }
            );
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('[API] POST /api/garden/plant error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
