
import { launchBot } from '../src/lib/telegram';

// Start polling
console.log('Starting Telegram Bot (Polling Mode)...');
launchBot().catch(console.error);
