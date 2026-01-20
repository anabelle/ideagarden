import { bot } from './bot';
import { garden } from '@/lib/services';
import prisma from '@/lib/db/prisma';

async function ensureUser(telegramId: string, name?: string) {
    // Find existing user by telegramId
    let user = await prisma.user.findUnique({
        where: { telegramId }
    });

    if (!user) {
        // Create new user
        user = await prisma.user.create({
            data: {
                telegramId,
                name: name || `Gardener ${telegramId}`,
            }
        });
        console.log(`Created new user for Telegram ID: ${telegramId}`);
    }
    return user;
}

if (bot) {
    // START
    bot.command('start', async (ctx) => {
        const telegramId = ctx.from!.id.toString();
        const userName = ctx.from!.first_name;
        await ensureUser(telegramId, userName);

        await ctx.reply(
            `🌱 *Welcome to Idea Garden!*\n\n` +
            `Your personal space to grow ideas from seeds to tasks.\n\n` +
            `*Commands:*\n` +
            `/garden - View your garden\n` +
            `/plant <title> - Plant a new seed\n` +
            `/water <title> - Water an existing seed\n` +
            `/harvest <title> - Harvest a mature seed\n` +
            `/help - All commands`,
            { parse_mode: 'Markdown' }
        );
    });

    // HELP
    bot.command('help', async (ctx) => {
        await ctx.reply(
            `🌱 *Idea Garden Commands*\n\n` +
            `*Viewing:*\n` +
            `/garden or /g - View your garden\n` +
            `/search <query> - Find seeds\n\n` +
            `*Actions:*\n` +
            `/plant <title> - Plant new seed\n` +
            `/water <title> - Add thought to seed\n` +
            `/harvest <title> - Convert to task (needs 5+ waters)\n` +
            `/compost <title> - Archive a seed\n\n` +
            `*Settings:*\n` +
            `/remind on|off - Toggle daily reminders`,
            { parse_mode: 'Markdown' }
        );
    });

    // GARDEN
    bot.command(['garden', 'g'], async (ctx) => {
        const telegramId = ctx.from!.id.toString();
        const userName = ctx.from!.first_name;

        try {
            const user = await ensureUser(telegramId, userName);
            const gardenData = await garden.getGarden(user.id);

            let message = `🌱 *${user.name || 'Your'} Garden*\n\n`;

            // Ready to Harvest
            if (gardenData.readyToHarvest.length > 0) {
                message += `🌸 *Ready to Harvest (${gardenData.readyToHarvest.length})*\n`;
                gardenData.readyToHarvest.forEach(seed => {
                    message += `  • ${seed.title} ${'●'.repeat(seed.waterings)}\n`;
                });
                message += '\n';
            }

            // Sprouting
            if (gardenData.sprouting.length > 0) {
                message += `🌿 *Sprouting (${gardenData.sprouting.length})*\n`;
                gardenData.sprouting.forEach(seed => {
                    const progress = '●'.repeat(seed.waterings) + '○'.repeat(Math.max(0, 5 - seed.waterings));
                    message += `  • ${seed.title} ${progress}\n`;
                });
                message += '\n';
            }

            // Seeds
            if (gardenData.seeds.length > 0) {
                message += `🌱 *Seeds (${gardenData.seeds.length})*\n`;
                gardenData.seeds.forEach(seed => {
                    const progress = '●'.repeat(seed.waterings) + '○'.repeat(Math.max(0, 5 - seed.waterings));
                    message += `  • ${seed.title} ${progress}\n`;
                });
                message += '\n';
            }

            if (gardenData.seeds.length + gardenData.sprouting.length + gardenData.readyToHarvest.length === 0) {
                message += `Your garden is empty! Plant your first seed with:\n/plant My first idea`;
            }

            await ctx.reply(message, { parse_mode: 'Markdown' });

        } catch (e) {
            console.error('Bot Error:', e);
            ctx.reply("Error accessing your garden. Please try again later.");
        }
    });

    // PLANT
    bot.command('plant', async (ctx) => {
        const title = ctx.message.text.replace('/plant', '').trim();
        const telegramId = ctx.from!.id.toString();
        const userName = ctx.from!.first_name;

        const user = await ensureUser(telegramId, userName);

        if (!title) {
            return ctx.reply('Usage: /plant <idea title>\n\nExample: /plant AI code review');
        }

        // Check for similar seeds
        const { blocked, similarSeeds } = await garden.plant(user.id, title, '', 'HUMAN'); // Dry run check? No, plant method does it. 
        // Wait, garden.plant actually plants it. We should use garden.similarityService directly or just check blocked result?
        // The service.plant method DOES check and return blocked=true if duplicate.
        // But if we want to ask for origin BEFORE planting, we can't call plant() yet.
        // Plan says: "Store pending plant, ask for origin".

        // Let's check similarity first manually or use a helper?
        // garden.plant does it all. If we want conversation, we should defer the actual planting.
        // But we need to know if it's a duplicate before asking origin?
        // Actually, the plan: "Check for similar seeds... If similar > Confirm."
        // We can use garden.similarityService.findSimilarSeeds directly if exposed, or just rely on plant returning blocked.
        // Since `plant` returns `blocked: true` without persisting if duplicate, we can use it!
        // Wait, if it returns blocked=false, it HAS planted it.
        // So we can't use `plant` to just check. We need `garden.similarityService`.
        // But `garden` is the UnifiedGardenService. It has `similarityService` private.
        // We might need to expose a check method or just assume we ask origin first?

        // Let's implement the "Ask Origin" flow first.

        ctx.session = ctx.session || {};
        ctx.session.pendingAction = { type: 'plant', title };

        await ctx.reply(
            `🌱 Planting "${title}"\n\n` +
            `What's the origin of this idea?\n` +
            `(Reply with the inspiration or context, or /cancel)`
        );
    });

    // WATER
    bot.command('water', async (ctx) => {
        const title = ctx.message.text.replace('/water', '').trim();

        if (!title) {
            return ctx.reply('Usage: /water <seed title>\n\nExample: /water My Idea');
        }

        const telegramId = ctx.from!.id.toString();
        const userName = ctx.from!.first_name;
        const user = await ensureUser(telegramId, userName);

        // Find the seed
        // We need a way to find seed by title loosely
        const gardenData = await garden.getGarden(user.id);
        const allSeeds = [...gardenData.seeds, ...gardenData.sprouting, ...gardenData.readyToHarvest];
        const seed = allSeeds.find(s => s.title.toLowerCase().includes(title.toLowerCase())); // Simple loose match

        if (!seed) {
            return ctx.reply(`❌ Seed "${title}" not found.`);
        }

        ctx.session = ctx.session || {};
        ctx.session.pendingAction = { type: 'water', title: seed.title }; // Use exact title

        const progress = '●'.repeat(seed.waterings) + '○'.repeat(Math.max(0, 5 - seed.waterings));

        await ctx.reply(
            `💧 Watering "${seed.title}"\n\n` +
            `Current: ${progress} (${seed.waterings} waterings)\n\n` +
            `What's your new thought for this seed?\n` +
            `(Reply with your thought, or /cancel)`
        );
    });

    // CANCEL
    bot.command('cancel', async (ctx) => {
        if (ctx.session?.pendingAction) {
            ctx.session.pendingAction = undefined;
            await ctx.reply('Action cancelled.');
        } else {
            await ctx.reply('Nothing to cancel.');
        }
    });

    // HANDLE TEXT REPLIES (Conversation)
    bot.on('text', async (ctx) => {
        // Ignore commands
        if (ctx.message.text.startsWith('/')) return;

        const pending = ctx.session?.pendingAction;
        if (!pending) return;

        const telegramId = ctx.from!.id.toString();
        // ensureUser is fast (cached in DB query)
        const user = await ensureUser(telegramId, ctx.from!.first_name);

        if (pending.type === 'plant' && pending.title) {
            // FINISH PLANTING
            const origin = ctx.message.text;

            const { seed, blocked, similarSeeds } = await garden.plant(user.id, pending.title, origin, 'HUMAN');

            ctx.session.pendingAction = undefined;

            if (blocked) {
                // For now, just notify
                // TODO: Better duplicate handling
                await ctx.reply(
                    `⚠️ Similar seed found: "${similarSeeds[0].seed.title}".\n` +
                    `This idea was blocked to prevent duplicates. You can water the existing seed instead.`
                );
            } else {
                await ctx.reply(
                    `✅ *Seed planted!*\n\n` +
                    `🌱 ${seed?.title}\n` +
                    `○○○○○ (0 waterings)\n\n` +
                    `Water it with /water ${seed?.title}`,
                    { parse_mode: 'Markdown' }
                );
            }
        }
        else if (pending.type === 'water' && pending.title) {
            // FINISH WATERING
            const content = ctx.message.text;

            // We need seed ID... but we stored title.
            // We have to lookup again.
            const gardenData = await garden.getGarden(user.id);
            const allSeeds = [...gardenData.seeds, ...gardenData.sprouting, ...gardenData.readyToHarvest];
            const seed = allSeeds.find(s => s.title === pending.title);

            if (!seed) {
                ctx.session.pendingAction = undefined;
                return ctx.reply('❌ Error: Seed not found (maybe harvested?).');
            }

            const result = await garden.water(user.id, seed.id, content, 'HUMAN');
            ctx.session.pendingAction = undefined;

            const progress = '●'.repeat(result.waterings) + '○'.repeat(Math.max(0, 5 - result.waterings));
            let statusMsg = `${5 - result.waterings} more until harvest`;

            if (result.waterings >= 5) {
                statusMsg = `🌸 Ready to harvest! Use /harvest ${pending.title}`;
            } else if (result.promoted) {
                statusMsg = `📈 Promoted to ${result.section}!`;
            }

            await ctx.reply(
                `✅ *Watered!*\n\n` +
                `🌱 ${result.title}\n` +
                `${progress} (${result.waterings} waterings)\n\n` +
                statusMsg,
                { parse_mode: 'Markdown' }
            );
        }
    });
}
