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
        const text = ctx.message.text.split(' ').slice(1).join(' ');
        if (!text) {
            return ctx.reply('Usage: /plant <title>');
        }

        const telegramId = ctx.from!.id.toString();
        const userName = ctx.from!.first_name;

        try {
            const user = await ensureUser(telegramId, userName);
            const { seed, blocked, similarSeeds } = await garden.plant(user.id, text, 'Planting via Telegram');

            if (blocked) {
                // TODO: Interactive buttons to confirm or link
                return ctx.reply(`Similar seed found: ${similarSeeds[0].seed.title}. Try watering it instead?`);
            }

            ctx.reply(`🌱 Planted: *${seed?.title}*`, { parse_mode: 'Markdown' });

        } catch (e) {
            console.error(e);
            ctx.reply('Failed to plant.');
        }
    });
}
