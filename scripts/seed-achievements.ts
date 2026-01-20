
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ACHIEVEMENT_LOOKUP } from '../src/lib/gamification/constants';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is missing');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding achievements...');

    for (const [id, data] of Object.entries(ACHIEVEMENT_LOOKUP)) {
        await prisma.achievement.upsert({
            where: { name: data.name },
            update: {
                description: data.description,
                icon: data.icon,
                xpReward: data.xpReward,
                condition: {}, // Placeholder
            },
            create: {
                id: id, // Use our constant ID as the DB UUID for simplicity if valid UUID, but these aren't.
                // Actually, let's just rely on name uniqueness or let Prisma gen IDs and we find by Name.
                // Better: Use the ID we defined as the ID in DB if possible? 
                // DB ID is CUID string. Our IDs are slug-like.
                // Let's just key by Name.
                name: data.name,
                description: data.description,
                icon: data.icon,
                xpReward: data.xpReward,
                condition: {},
            },
        });
        console.log(`✅ Upserted: ${data.name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
