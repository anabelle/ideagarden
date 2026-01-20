import { bot } from './bot';
import { garden } from '@/lib/services';
import './commands'; // Import to register commands

// Helper to launch in long-polling mode for dev
export async function launchBot() {
    if (!bot) {
        console.warn('TELEGRAM_BOT_TOKEN not set, skipping bot launch.');
        return;
    }

    console.log('🤖 Starting Telegram Bot...');

    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    await bot.launch();
    console.log('✅ Telegram Bot started!');
}

// If run directly (e.g. npx tsx src/lib/telegram/index.ts)
if (require.main === module) {
    launchBot();
}
