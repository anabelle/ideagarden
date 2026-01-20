/**
 * 🌱 Idea Garden - Merge Seeds API Route
 * 
 * POST /api/garden/merge - Merge multiple similar seeds into one
 */

import { NextRequest, NextResponse } from 'next/server';
import { garden } from '@/lib/services';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth-middleware';

interface MergeRequest {
    primarySeedId: string;
    otherSeedIds: string[];
    synthesisContent: string;
}

/**
 * POST /api/garden/merge
 * 
 * Request body:
 * {
 *   "primarySeedId": "uuid-of-primary-seed",
 *   "otherSeedIds": ["uuid-1", "uuid-2"],
 *   "synthesisContent": "Combined insight from all seeds..."
 * }
 * 
 * Returns:
 * - The merged primary seed with combined waterings
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request);

        if (isAuthError(authResult)) {
            return authResult.error;
        }

        const userId = authResult.userId;

        // Parse and validate request body
        let body: MergeRequest;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        if (!body.primarySeedId || typeof body.primarySeedId !== 'string') {
            return NextResponse.json(
                { error: 'primarySeedId is required and must be a string' },
                { status: 400 }
            );
        }

        if (!Array.isArray(body.otherSeedIds) || body.otherSeedIds.length === 0) {
            return NextResponse.json(
                { error: 'otherSeedIds must be a non-empty array of seed IDs' },
                { status: 400 }
            );
        }

        if (!body.otherSeedIds.every(id => typeof id === 'string')) {
            return NextResponse.json(
                { error: 'All otherSeedIds must be strings' },
                { status: 400 }
            );
        }

        if (!body.synthesisContent || typeof body.synthesisContent !== 'string' || body.synthesisContent.trim().length === 0) {
            return NextResponse.json(
                { error: 'synthesisContent is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // Merge the seeds
        const mergedSeed = await garden.merge(
            userId,
            body.primarySeedId,
            body.otherSeedIds,
            body.synthesisContent.trim()
        );

        return NextResponse.json({
            seed: mergedSeed,
            mergedCount: body.otherSeedIds.length + 1,
            message: `🌿 Successfully merged ${body.otherSeedIds.length + 1} seeds into one stronger idea!`
        }, { status: 200 });
    } catch (error) {
        console.error('[API] POST /api/garden/merge error:', error);

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('not active')) {
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
