/**
 * 🌱 Idea Garden - Auth Middleware Helper
 * 
 * Utility functions for getting authenticated user in API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export type AuthResult = {
    userId: string;
} | {
    error: NextResponse<{ error: string }>;
};

/**
 * Get the authenticated user ID from the request.
 * First tries NextAuth session, then falls back to x-user-id header for dev/testing.
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
    // Try NextAuth session first
    const session = await auth();

    if (session?.user?.id) {
        return { userId: session.user.id };
    }

    // Fallback to header for development/testing
    const headerUserId = request.headers.get('x-user-id');
    const queryUserId = request.nextUrl.searchParams.get('userId');

    if (headerUserId || queryUserId) {
        return { userId: (headerUserId || queryUserId)! };
    }

    return {
        error: NextResponse.json(
            { error: 'Unauthorized: Please sign in' },
            { status: 401 }
        )
    };
}

/**
 * Check if the result is an error
 */
export function isAuthError(result: AuthResult): result is { error: NextResponse<{ error: string }> } {
    return 'error' in result;
}
