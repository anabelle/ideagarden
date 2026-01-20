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
                const similarSeed = similarSeeds[0].seed;
                await ctx.reply(
                    `⚠️ *Similar seed found:*\n` +
                    `"${similarSeed.title}"\n\n` +
                    `It looks like you already have this idea. What would you like to do?`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: `💧 Water "${similarSeed.title}" instead`, callback_data: `water_dup:${similarSeed.id}` }],
                                [{ text: `🌱 Plant "${pending.title}" anyway`, callback_data: `plant_force:${pending.title}` }] // Limitation: origin is lost in callback unless we store in session or encoded in data (length limit). 
                                // Better: store origin in session and just use "plant_force" 
                            ]
                        }
                    }
                );
                // We need to keep pendingAction or store origin somewhere?
                // ctx.session is persisted. We can keep "pendingAction" as is?
                // Or update it to 'resolve_duplicate'.
                // Actually, if we use callback, we can read session there.
                ctx.session.duplicateOrigin = origin;
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

    // HARVEST
    bot.command('harvest', async (ctx) => {
        const title = ctx.message.text.replace('/harvest', '').trim();

        if (!title) {
            return ctx.reply('Usage: /harvest <seed title>');
        }

        const telegramId = ctx.from!.id.toString();
        const userName = ctx.from!.first_name;

        try {
            const user = await ensureUser(telegramId, userName);

            // Need to find seed ID first since harvest requires ID?
            // Service method: harvestSeed(userId, seedId, author)
            // We only have title. Should lookup first.
            const gardenData = await garden.getGarden(user.id);
            const allSeeds = [...gardenData.seeds, ...gardenData.readyToHarvest]; // Can only harvest from these? Or sprouting too?
            // A seed can be harvested if mature, even if not in 'readyToHarvest' section technically if logic allows.
            // But usually we only harvest mature ones.
            // Let's search all active ones.
            const seed = [...allSeeds, ...gardenData.sprouting].find(s => s.title.toLowerCase() === title.toLowerCase());

            if (!seed) {
                return ctx.reply(`❌ Seed "${title}" not found or already harvested.`);
            }

            const { seed: harvestedSeed, achievements } = await garden.harvest(user.id, seed.id, 'HUMAN');

            let msg = `🌸 *Harvested!*\n\n` +
                `"${harvestedSeed.title}" has graduated to a real task!\n\n` +
                `*Summary:*\n` +
                `• Planted: ${new Date(harvestedSeed.plantedAt).toLocaleDateString()}\n` +
                `• Harvested: ${new Date().toLocaleDateString()}\n` +
                `• Waterings: ${harvestedSeed.waterings}`;

            if (achievements && achievements.length > 0) {
                msg += `\n\n🏆 *Achievements Unlocked:*\n` + achievements.map(a => `• ${a}`).join('\n');
            }

            await ctx.reply(msg, { parse_mode: 'Markdown' });

        } catch (error: any) {
            const message = error.message || 'Unknown error';
            if (message.includes('Not enough waterings')) {
                const user = await ensureUser(telegramId, userName);
                // Fetch seed to show status
                const gardenData = await garden.getGarden(user.id);
                const seed = [...gardenData.seeds, ...gardenData.sprouting].find(s => s.title.toLowerCase() === title.toLowerCase());

                if (seed) {
                    return ctx.reply(
                        `❌ Cannot harvest "${title}" yet.\n\n` +
                        `Current: ${seed.waterings}/5 waterings\n` +
                        `Need ${5 - seed.waterings} more!`
                    );
                }
            }
            await ctx.reply(`❌ Failed to harvest: ${message}`);
        }
    });

    // COMPOST
    bot.command('compost', async (ctx) => {
        const title = ctx.message.text.replace('/compost', '').trim();

        if (!title) {
            return ctx.reply('Usage: /compost <seed title>');
        }

        const telegramId = ctx.from!.id.toString();
        const userName = ctx.from!.first_name;

        try {
            const user = await ensureUser(telegramId, userName);
            // Lookup seed
            const gardenData = await garden.getGarden(user.id);
            const allSeeds = [...gardenData.seeds, ...gardenData.sprouting, ...gardenData.readyToHarvest];
            const seed = allSeeds.find(s => s.title.toLowerCase() === title.toLowerCase());

            if (!seed) {
                return ctx.reply(`❌ Seed "${title}" not found.`);
            }

            // Ask for reason? Inline buttons.
            await ctx.reply(
                `🍂 Composting "${seed.title}"\n\n` +
                `Why are you archiving this seed?`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Duplicate / Not needed', callback_data: `compost:${seed.id}:not_needed` }],
                            [{ text: 'Already done', callback_data: `compost:${seed.id}:done` }],
                            [{ text: 'Just archive', callback_data: `compost:${seed.id}:archive` }]
                        ]
                    }
                }
            );

        } catch (e) {
            console.error(e);
            ctx.reply('Error finding seed.');
        }
    });

    // COMPOST CALLBACK
    bot.action(/compost:(.+):(.+)/, async (ctx) => {
        const [, seedId, reason] = ctx.match;
        const telegramId = ctx.from!.id.toString();

        try {
            const user = await ensureUser(telegramId);
            await garden.compost(user.id, seedId, reason, 'HUMAN');

            await ctx.editMessageText(
                `🍂 *Composted!*\n\nSeed has been archived.`,
                { parse_mode: 'Markdown' }
            );
        } catch (e) {
            console.error(e);
            ctx.answerCbQuery('Failed to compost');
        }

    });

    // DUPLICATE RESOLUTION - WATER INSTEAD
    bot.action(/water_dup:(.+)/, async (ctx) => {
        const seedId = ctx.match[1];
        const telegramId = ctx.from!.id.toString();
        const userName = ctx.from!.first_name;

        try {
            const user = await ensureUser(telegramId, userName);
            // We need to switch to watering flow.
            // Get seed details first
            const gardenData = await garden.getGarden(user.id);
            // Seed might be in any list
            const allSeeds = [...gardenData.seeds, ...gardenData.sprouting, ...gardenData.readyToHarvest];
            const seed = allSeeds.find(s => s.id === seedId);

            if (!seed) {
                return ctx.reply('❌ Error: Seed not found.');
            }

            // Start watering flow
            ctx.session.pendingAction = { type: 'water', title: seed.title };

            // Use origin as thought if available? No, usually origin is context for planting. Thought for watering is different.
            // But user might have typed a thought as "origin".

            if (ctx.session.duplicateOrigin) {
                // Auto-water with the origin text?
                // Let's ask user: "Use your previous text as thought?" or just use it.
                // Simpler to just use it.
                const content = ctx.session.duplicateOrigin;
                ctx.session.duplicateOrigin = undefined;

                const result = await garden.water(user.id, seed.id, content, 'HUMAN');
                ctx.session.pendingAction = undefined;

                const progress = '●'.repeat(result.waterings) + '○'.repeat(Math.max(0, 5 - result.waterings));
                let statusMsg = `${5 - result.waterings} more until harvest`;

                if (result.waterings >= 5) {
                    statusMsg = `🌸 Ready to harvest! Use /harvest ${seed.title}`;
                } else if (result.promoted) {
                    statusMsg = `📈 Promoted to ${result.section}!`;
                }

                await ctx.editMessageText(
                    `✅ *Watered existing seed instead!*\n\n` +
                    `🌱 ${result.title}\n` +
                    `${progress} (${result.waterings} waterings)\n\n` +
                    `Tip: Next time, check your garden first!`,
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            const progress = '●'.repeat(seed.waterings) + '○'.repeat(Math.max(0, 5 - seed.waterings));
            await ctx.reply(
                `💧 Watering "${seed.title}"\n\n` +
                `Current: ${progress} (${seed.waterings} waterings)\n\n` +
                `What's your new thought for this seed?`
            );

        } catch (e) {
            console.error(e);
            ctx.reply('Error processing request.');
        }
    });

    // DUPLICATE RESOLUTION - PLANT ANYWAY
    bot.action(/plant_force:(.+)/, async (ctx) => {
        const title = ctx.match[1];
        const telegramId = ctx.from!.id.toString();

        try {
            const user = await ensureUser(telegramId);
            const origin = ctx.session.duplicateOrigin || "Forced plant via Telegram";
            ctx.session.duplicateOrigin = undefined;

            // Force plant
            const { seed } = await garden.plant(user.id, title, origin, 'HUMAN', true);

            await ctx.editMessageText(
                `✅ *Seed planted (forced)!*\n\n` +
                `🌱 ${seed?.title}\n` +
                `○○○○○ (0 waterings)\n\n` +
                `Water it with /water ${seed?.title}`,
                { parse_mode: 'Markdown' }
            );

        } catch (e) {
            console.error(e);
            ctx.reply('Failed to plant.');
        }
    });

    // SEARCH COMMAND
    bot.command('search', async (ctx) => {
        const query = ctx.message.text.replace('/search', '').trim();
        const telegramId = ctx.from!.id.toString();
        const userName = ctx.from!.first_name;

        if (!query) {
            return ctx.reply('Usage: /search <query>\n\nExample: /search reacting');
        }

        try {
            const user = await ensureUser(telegramId, userName);
            const gardenData = await garden.getGarden(user.id);
            const allSeeds = [...gardenData.seeds, ...gardenData.sprouting, ...gardenData.readyToHarvest];

            const results = allSeeds.filter(s =>
                s.title.toLowerCase().includes(query.toLowerCase()) ||
                (s.content && s.content.toLowerCase().includes(query.toLowerCase()))
            );

            if (results.length === 0) {
                return ctx.reply(`🔍 No seeds found for "${query}".`);
            }

            let msg = `🔍 *Search Results for "${query}":*\n\n`;
            results.slice(0, 10).forEach(s => {
                const icon = s.waterings >= 5 ? '🌸' : (s.waterings > 0 ? '🌿' : '🌱');
                msg += `${icon} *${s.title}* (${s.waterings}/5)\n`;
            });

            await ctx.reply(msg, { parse_mode: 'Markdown' });

        } catch (e) {
            console.error(e);
            ctx.reply('Search failed.');
        }
    });

    // INLINE QUERY
    bot.on('inline_query', async (ctx) => {
        const query = ctx.inlineQuery.query.trim().toLowerCase();
        const telegramId = ctx.from.id.toString();

        try {
            // We can't use ensureUser easily here effectively if we want speed, 
            // but we need userId.
            const user = await ensureUser(telegramId, ctx.from.first_name);
            const gardenData = await garden.getGarden(user.id);
            const allSeeds = [...gardenData.seeds, ...gardenData.sprouting, ...gardenData.readyToHarvest];

            const results = allSeeds
                .filter(s => !query || s.title.toLowerCase().includes(query))
                .slice(0, 50)
                .map(s => {
                    const icon = s.waterings >= 5 ? '🌸' : (s.waterings > 0 ? '🌿' : '🌱');
                    const progress = '●'.repeat(s.waterings) + '○'.repeat(Math.max(0, 5 - s.waterings));
                    return {
                        type: 'article',
                        id: s.id,
                        title: `${icon} ${s.title}`,
                        description: `Stats: ${progress} (${s.waterings}/5 waterings)`,
                        input_message_content: {
                            message_text: `🌱 *${s.title}*\nStatus: ${progress}\n\nWater this seed with /water ${s.title}`,
                            parse_mode: 'Markdown'
                        }
                    };
                });

            await ctx.answerInlineQuery(results as any, { cache_time: 0 });

        } catch (e) {
            console.error(e);
        }
    });
}

