import { GardenService, SPROUTING_THRESHOLD, HARVEST_THRESHOLD } from '../garden-service';
import prisma from '@/lib/db/prisma';

describe('GardenService', () => {
    let service: GardenService;
    const testUserId = 'test-user-' + Date.now();

    beforeAll(async () => {
        service = new GardenService();
        // Create test user
        await prisma.user.create({
            data: {
                id: testUserId,
                email: `${testUserId}@example.com`,
                name: 'Test User',
            }
        });
    });

    afterAll(async () => {
        // Cleanup all seeds for test user
        await prisma.seed.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
        await prisma.$disconnect();
    });

    it('should plant a seed correctly', async () => {
        const seed = await service.plantSeed(testUserId, 'Test Seed', 'Original thought');

        expect(seed.title).toBe('Test Seed');
        expect(seed.status).toBe('ACTIVE');
        expect(seed.section).toBe('SEEDS');
        expect(seed.waterings).toBe(0);

        const fetched = await service.getSeed(testUserId, seed.id);
        expect(fetched?.id).toBe(seed.id);
    });

    it('should water a seed and promote it to SPROUTING', async () => {
        const seed = await service.plantSeed(testUserId, 'Sprout Seed', 'Waiting to grow');

        // Water 2 times (total 2)
        await service.waterSeed(testUserId, seed.id, 'Thought 1');
        const res2 = await service.waterSeed(testUserId, seed.id, 'Thought 2');
        expect(res2.promoted).toBe(false);

        // Water 3rd time (total 3) -> Should promote
        const res3 = await service.waterSeed(testUserId, seed.id, 'Thought 3');
        expect(res3.promoted).toBe(true);
        expect(res3.newSection).toBe('SPROUTING');

        const updated = await service.getSeed(testUserId, seed.id);
        expect(updated?.section).toBe('SPROUTING');
        expect(updated?.waterings).toBe(3);
    });

    it('should promote to READY_TO_HARVEST at 5 waterings', async () => {
        const seed = await service.plantSeed(testUserId, 'Harvest Seed', 'Ready soon');

        // Water 5 times
        for (let i = 0; i < 4; i++) {
            await service.waterSeed(testUserId, seed.id, `Thought ${i}`);
        }

        const res5 = await service.waterSeed(testUserId, seed.id, 'The Final Thought');
        expect(res5.promoted).toBe(true);
        expect(res5.newSection).toBe('READY_TO_HARVEST');
    });

    it('should harvest a mature seed', async () => {
        const seed = await service.plantSeed(testUserId, 'Mature Seed', 'I am ready');

        // Water 5 times
        for (let i = 0; i < 5; i++) {
            await service.waterSeed(testUserId, seed.id, `Water ${i}`);
        }

        const harvested = await service.harvestSeed(testUserId, seed.id);
        expect(harvested.status).toBe('HARVESTED');
        expect(harvested.section).toBe('COMPOST');
    });

    it('should fail to harvest an immature seed', async () => {
        const seed = await service.plantSeed(testUserId, 'Immature Seed', 'Not yet');
        await expect(service.harvestSeed(testUserId, seed.id)).rejects.toThrow();
    });

    it('should compost a seed and maintain limit', async () => {
        // Compost is shared between harvested and composted items in the "compost" section
        // We set limit to 5
        for (let i = 0; i < 7; i++) {
            const seed = await service.plantSeed(testUserId, `Waste ${i}`, 'To be composted');
            await service.compostSeed(testUserId, seed.id, 'Cleanup');
        }

        const garden = await service.getGarden(testUserId);
        expect(garden.composted.length).toBeLessThanOrEqual(5);
    });
});
