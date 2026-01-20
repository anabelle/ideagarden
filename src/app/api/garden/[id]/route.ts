import { NextRequest, NextResponse } from 'next/server';
import { GardenService } from '@/lib/services/garden-service';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth-middleware';

const gardenService = new GardenService();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await getAuthenticatedUser(request);
        if (isAuthError(authResult)) {
            return authResult.error;
        }

        const { userId } = authResult;
        const { id } = await params;

        const seed = await gardenService.getSeed(userId, id);

        if (!seed) {
            return NextResponse.json(
                { error: 'Seed not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(seed);

    } catch (error) {
        console.error('Error fetching seed details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch seed details' },
            { status: 500 }
        );
    }
}
