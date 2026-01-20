/**
 * 🌱 Idea Garden - Consolidation Suggestions API Route
 * 
 * GET /api/garden/consolidate - Get suggestions for seeds that could be merged
 */

import { NextRequest, NextResponse } from 'next/server';
import { garden } from '@/lib/services';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth-middleware';

/**
 * GET /api/garden/consolidate
 * 
 * Returns:
 * - Array of merge suggestions, each containing:
 *   - primary: The seed to keep
 *   - others: Similar seeds that could be merged
 *   - similarity: The similarity score
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await getAuthenticatedUser(request);

        if (isAuthError(authResult)) {
            return authResult.error;
        }

        const userId = authResult.userId;

        const suggestions = await garden.getConsolidationSuggestions(userId);

        return NextResponse.json({
            suggestions,
            count: suggestions.length,
            message: suggestions.length > 0
                ? `Found ${suggestions.length} potential merge opportunities!`
                : 'No similar seeds found to consolidate.'
        }, { status: 200 });
    } catch (error) {
        console.error('[API] GET /api/garden/consolidate error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
