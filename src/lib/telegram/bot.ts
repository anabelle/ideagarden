import { Telegraf, Context, session } from 'telegraf';
import { garden } from '@/lib/services';
import { SessionData } from './types';

// Extend Context to include session
interface BotContext extends Context {
    session: SessionData;
}

const token = process.env.TELEGRAM_BOT_TOKEN;

// Initialize bot only if token exists (avoids crash during build if missing)
export const bot = token ? new Telegraf<BotContext>(token) : null;

if (bot) {
    bot.use(session());

    // Basic middleware for logging
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        console.log('Response time: %sms', ms);
    });
}
