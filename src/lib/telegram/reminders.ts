import prisma from '@/lib/db/prisma';
import { bot } from '@/lib/telegram/bot';
import { garden } from '@/lib/services';

type ReminderSummary = {
    readyToHarvestTitles: string[];
    needsWaterTitles: string[];
};

function minutesSince(date: Date) {
    return (Date.now() - date.getTime()) / (1000 * 60);
}

async function buildReminderSummary(userId: string): Promise<ReminderSummary> {
    const gardenData = await garden.getGarden(userId);
    const activeSeeds = [...gardenData.seeds, ...gardenData.sprouting, ...gardenData.readyToHarvest];

    const readyToHarvestTitles = gardenData.readyToHarvest.map(s => s.title);

    // “Needs water” = not updated in 7+ days (very simple heuristic)
    const needsWaterTitles = activeSeeds
        .filter(s => minutesSince(new Date(s.updatedAt)) >= 7 * 24 * 60)
        .map(s => s.title);

    return { readyToHarvestTitles, needsWaterTitles };
}

function formatReminderMessage(summary: ReminderSummary) {
    let message = `🌱 *Good morning! Your garden update:*\n\n`;

    if (summary.readyToHarvestTitles.length > 0) {
        message += `🌸 *Ready to harvest (${summary.readyToHarvestTitles.length})*\n`;
        for (const title of summary.readyToHarvestTitles.slice(0, 10)) {
            message += `  • ${title}\n`;
        }
        message += '\n';
    }

    if (summary.needsWaterTitles.length > 0) {
        message += `💤 *Needs water (${summary.needsWaterTitles.length})*\n`;
        for (const title of summary.needsWaterTitles.slice(0, 10)) {
            message += `  • ${title}\n`;
        }
        message += '\n';
    }

    if (summary.readyToHarvestTitles.length === 0 && summary.needsWaterTitles.length === 0) {
        message += `Your garden looks happy today.\n\n`;
    }

    message += `Reply /garden to see the full view.`;
    return message;
}

function shouldSendNow(reminderTime: string, timezone: string, now = new Date()) {
    // Minimal implementation: only supports UTC correctly.
    // If timezone isn’t UTC, we still run using server time.
    // (We default new users to UTC in schema.)
    const [hh, mm] = reminderTime.split(':').map(v => Number(v));
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;

    const hours = timezone === 'UTC' ? now.getUTCHours() : now.getHours();
    const minutes = timezone === 'UTC' ? now.getUTCMinutes() : now.getMinutes();

    return hours === hh && minutes >= mm && minutes < mm + 10;
}

export async function sendDailyReminders(now = new Date()) {
    if (!bot) {
        throw new Error('Bot not configured');
    }

    const users = await prisma.user.findMany({
        where: {
            telegramId: { not: null },
            remindersEnabled: true,
        },
        select: {
            id: true,
            telegramId: true,
            reminderTime: true,
            timezone: true,
        },
    });

    const results = {
        totalUsers: users.length,
        attempted: 0,
        sent: 0,
        skippedTime: 0,
        failed: 0,
    };

    for (const user of users) {
        if (!user.telegramId) continue;

        if (!shouldSendNow(user.reminderTime, user.timezone, now)) {
            results.skippedTime += 1;
            continue;
        }

        results.attempted += 1;

        try {
            const summary = await buildReminderSummary(user.id);
            const message = formatReminderMessage(summary);
            await bot.telegram.sendMessage(user.telegramId, message, { parse_mode: 'Markdown' });
            results.sent += 1;
        } catch (error) {
            console.error(`Failed to send reminder to ${user.telegramId}:`, error);
            results.failed += 1;
        }
    }

    return results;
}
