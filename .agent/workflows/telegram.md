---
description: Telegram bot and Mini App development
---

# Telegram Development Workflow

Use this workflow for Phase 6 (Telegram Bot) and Phase 7 (Mini App).

---

## Prerequisites

Before starting Phase 6:
1. Create a Telegram bot with @BotFather
2. Get the bot token
3. Add token to `.env.local` as `TELEGRAM_BOT_TOKEN`

---

## Phase 6: Telegram Bot

### Task 6.1: Register Bot with @BotFather

Manual step - user must do this:
1. Open Telegram, search for @BotFather
2. Send `/newbot`
3. Choose name: "Idea Garden"
4. Choose username: e.g., `YourIdeaGardenBot`
5. Copy the token

Add to `.env.local`:
```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

Set bot commands with @BotFather:
```
/setcommands

garden - View your garden
plant - Plant a new seed
water - Water an existing seed
harvest - Harvest a mature seed
compost - Archive a seed
search - Search your seeds
remind - Toggle daily reminders
help - Show all commands
```

### Task 6.2: Set Up Telegraf.js Bot Server

Install dependencies:
```bash
npm install telegraf
```

Create `/src/lib/telegram/bot.ts`:

```typescript
import { Telegraf, Context, session } from 'telegraf';
import { UnifiedGardenService } from '../services';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const garden = new UnifiedGardenService();

// Session middleware for conversation state
bot.use(session());

export { bot };
```

Create `/src/lib/telegram/types.ts`:
```typescript
interface SessionData {
  pendingAction?: {
    type: 'plant' | 'water';
    title?: string;
  };
}

interface BotContext extends Context {
  session: SessionData;
}
```

### Task 6.3: Implement /start and /help

```typescript
bot.command('start', async (ctx) => {
  const telegramId = ctx.from!.id.toString();
  await garden.initUser(telegramId);
  
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
```

### Task 6.4: Implement /garden

```typescript
bot.command(['garden', 'g'], async (ctx) => {
  const userId = ctx.from!.id.toString();
  const state = await garden.read(userId);
  
  let message = `🌱 *Your Idea Garden*\n\n`;
  
  // Ready to Harvest (highlight first)
  if (state.readyToHarvest.length > 0) {
    message += `🌸 *Ready to Harvest (${state.readyToHarvest.length})*\n`;
    state.readyToHarvest.forEach(seed => {
      message += `  • ${seed.title} ${'●'.repeat(seed.waterings)}\n`;
    });
    message += '\n';
  }
  
  // Sprouting
  if (state.sprouting.length > 0) {
    message += `🌿 *Sprouting (${state.sprouting.length})*\n`;
    state.sprouting.forEach(seed => {
      const progress = '●'.repeat(seed.waterings) + '○'.repeat(5 - seed.waterings);
      message += `  • ${seed.title} ${progress}\n`;
    });
    message += '\n';
  }
  
  // Seeds
  if (state.seeds.length > 0) {
    message += `🌱 *Seeds (${state.seeds.length})*\n`;
    state.seeds.forEach(seed => {
      const progress = '●'.repeat(seed.waterings) + '○'.repeat(5 - seed.waterings);
      message += `  • ${seed.title} ${progress}\n`;
    });
    message += '\n';
  }
  
  // Compost (collapsed)
  if (state.compost.length > 0) {
    message += `🍂 Compost: ${state.compost.length} archived\n`;
  }
  
  if (state.seeds.length + state.sprouting.length + state.readyToHarvest.length === 0) {
    message += `Your garden is empty! Plant your first seed with:\n/plant My first idea`;
  }
  
  await ctx.reply(message, { parse_mode: 'Markdown' });
});
```

### Task 6.5: Implement /plant with Conversation

```typescript
bot.command('plant', async (ctx) => {
  const title = ctx.message.text.replace('/plant', '').trim();
  
  if (!title) {
    return ctx.reply('Usage: /plant <idea title>\n\nExample: /plant AI code review');
  }
  
  const userId = ctx.from!.id.toString();
  
  // Check for similar seeds
  const similar = await garden.findSimilar(userId, title);
  
  if (similar.length > 0) {
    const buttons = similar.map(s => ([
      { text: `💧 Water "${s.title}"`, callback_data: `water:${s.id}` }
    ]));
    buttons.push([{ text: '🌱 Plant anyway', callback_data: `plant_confirm:${title}` }]);
    
    return ctx.reply(
      `⚠️ *Similar seeds found:*\n\n` +
      similar.map(s => `🌱 "${s.title}" (${s.similarity}% similar, ${s.waterings} waterings)`).join('\n') +
      `\n\nWould you rather water an existing seed?`,
      { 
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons }
      }
    );
  }
  
  // Store pending plant, ask for origin
  ctx.session.pendingAction = { type: 'plant', title };
  
  await ctx.reply(
    `🌱 Planting "${title}"\n\n` +
    `What's the origin of this idea?\n` +
    `(Reply with the inspiration or context)`
  );
});

// Handle reply for pending plant
bot.on('text', async (ctx) => {
  const pending = ctx.session.pendingAction;
  
  if (pending?.type === 'plant' && pending.title) {
    const userId = ctx.from!.id.toString();
    const result = await garden.plant(userId, pending.title, ctx.message.text, 'HUMAN');
    
    ctx.session.pendingAction = undefined;
    
    await ctx.reply(
      `✅ *Seed planted!*\n\n` +
      `🌱 ${pending.title}\n` +
      `○○○○○ (0 waterings)\n\n` +
      `Water it with /water ${pending.title}`,
      { parse_mode: 'Markdown' }
    );
  }
  
  if (pending?.type === 'water' && pending.title) {
    const userId = ctx.from!.id.toString();
    const result = await garden.water(userId, pending.title, ctx.message.text, 'HUMAN');
    
    ctx.session.pendingAction = undefined;
    
    const progress = '●'.repeat(result.waterings) + '○'.repeat(5 - result.waterings);
    let statusMsg = `${5 - result.waterings} more until harvest`;
    
    if (result.waterings >= 5) {
      statusMsg = `🌸 Ready to harvest! Use /harvest ${pending.title}`;
    } else if (result.promoted) {
      statusMsg = `📈 Promoted to ${result.section}!`;
    }
    
    await ctx.reply(
      `✅ *Watered!*\n\n` +
      `🌱 ${pending.title}\n` +
      `${progress} (${result.waterings} waterings)\n\n` +
      statusMsg,
      { parse_mode: 'Markdown' }
    );
  }
});
```

### Task 6.6: Implement /water

```typescript
bot.command('water', async (ctx) => {
  const title = ctx.message.text.replace('/water', '').trim();
  
  if (!title) {
    return ctx.reply('Usage: /water <seed title>\n\nExample: /water AI code review');
  }
  
  const userId = ctx.from!.id.toString();
  const seed = await garden.getSeed(userId, title);
  
  if (!seed) {
    // Fuzzy search for suggestions
    const suggestions = await garden.searchSeeds(userId, title);
    if (suggestions.length > 0) {
      return ctx.reply(
        `❌ Seed "${title}" not found.\n\nDid you mean:\n` +
        suggestions.map(s => `• ${s.title}`).join('\n')
      );
    }
    return ctx.reply(`❌ Seed "${title}" not found.`);
  }
  
  const progress = '●'.repeat(seed.waterings) + '○'.repeat(5 - seed.waterings);
  
  ctx.session.pendingAction = { type: 'water', title: seed.title };
  
  await ctx.reply(
    `💧 Watering "${seed.title}"\n\n` +
    `Current: ${progress} (${seed.waterings} waterings)\n\n` +
    `What's your new thought for this seed?`
  );
});
```

### Task 6.7: Implement /harvest and /compost

```typescript
bot.command('harvest', async (ctx) => {
  const title = ctx.message.text.replace('/harvest', '').trim();
  
  if (!title) {
    return ctx.reply('Usage: /harvest <seed title>');
  }
  
  const userId = ctx.from!.id.toString();
  
  try {
    const result = await garden.harvest(userId, title, 'HUMAN');
    
    await ctx.reply(
      `🌸 *Harvested!*\n\n` +
      `"${title}" has graduated to a real task!\n\n` +
      `*Summary:*\n` +
      `• Planted: ${result.plantedAt}\n` +
      `• Harvested: ${result.harvestedAt}\n` +
      `• Waterings: ${result.waterings}\n\n` +
      `The full watering log has been saved.`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    if (error.message.includes('not enough waterings')) {
      const seed = await garden.getSeed(userId, title);
      await ctx.reply(
        `❌ Cannot harvest "${title}" yet.\n\n` +
        `Current: ${seed.waterings}/5 waterings\n` +
        `Need ${5 - seed.waterings} more!`
      );
    } else {
      await ctx.reply(`❌ ${error.message}`);
    }
  }
});

bot.command('compost', async (ctx) => {
  const title = ctx.message.text.replace('/compost', '').trim();
  
  if (!title) {
    return ctx.reply('Usage: /compost <seed title>');
  }
  
  const userId = ctx.from!.id.toString();
  
  await ctx.reply(
    `🍂 Composting "${title}"\n\n` +
    `Why are you archiving this seed? (optional)`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'No longer relevant', callback_data: `compost:${title}:no_longer_relevant` }],
          [{ text: 'Already done', callback_data: `compost:${title}:already_done` }],
          [{ text: 'Just archive', callback_data: `compost:${title}:` }]
        ]
      }
    }
  );
});

bot.action(/compost:(.+):(.*)/, async (ctx) => {
  const [, title, reason] = ctx.match!;
  const userId = ctx.from!.id.toString();
  
  await garden.compost(userId, title, reason || undefined, 'HUMAN');
  
  await ctx.editMessageText(
    `🍂 *Composted!*\n\n` +
    `"${title}" has been archived.`,
    { parse_mode: 'Markdown' }
  );
});
```

### Task 6.8: Similar Seed Warnings

Already implemented in Task 6.5 with inline buttons.

### Task 6.9: Inline Mode

```typescript
bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query.trim();
  const userId = ctx.from!.id.toString();
  
  if (!query) {
    return ctx.answerInlineQuery([]);
  }
  
  const seeds = await garden.searchSeeds(userId, query);
  
  const results = seeds.map(seed => ({
    type: 'article' as const,
    id: seed.id,
    title: `🌱 ${seed.title}`,
    description: `${seed.waterings} waterings - ${seed.section}`,
    input_message_content: {
      message_text: `🌱 *${seed.title}*\n\n${seed.origin}\n\nWaterings: ${seed.waterings}/5`,
      parse_mode: 'Markdown' as const
    }
  }));
  
  await ctx.answerInlineQuery(results);
});
```

### Task 6.10: Daily Reminders

Create a cron job or scheduled function:

```typescript
// /src/lib/telegram/reminders.ts
import { bot } from './bot';
import { prisma } from '../db';

export async function sendDailyReminders() {
  // Get users with reminders enabled
  const users = await prisma.user.findMany({
    where: { telegramReminders: true },
    include: { 
      seeds: { where: { status: 'ACTIVE' } } 
    }
  });
  
  for (const user of users) {
    const neglected = user.seeds.filter(s => {
      const daysSinceWater = (Date.now() - s.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceWater >= 7;
    });
    
    const ready = user.seeds.filter(s => s.waterings >= 5);
    
    let message = `🌱 *Good morning! Your garden update:*\n\n`;
    
    if (ready.length > 0) {
      message += `🌸 *Ready to harvest (${ready.length})*\n`;
      ready.forEach(s => { message += `  • ${s.title}\n`; });
      message += '\n';
    }
    
    if (neglected.length > 0) {
      message += `💤 *Needs water (${neglected.length})*\n`;
      neglected.forEach(s => { message += `  • ${s.title}\n`; });
    }
    
    message += '\nReply /garden to see full view.';
    
    try {
      await bot.telegram.sendMessage(user.telegramId!, message, { parse_mode: 'Markdown' });
    } catch (e) {
      console.error(`Failed to send reminder to ${user.telegramId}:`, e);
    }
  }
}
```

---

## Phase 7: Telegram Mini App

### Task 7.1: Mini App Configuration

Set up Mini App with @BotFather:
1. `/setmenubutton` → Set Web App URL
2. Create `/src/app/twa/page.tsx` for Mini App entry

Add Telegram WebApp SDK:
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

### Task 7.2-7.8: Mini App Implementation

Create mobile-first UI in `/src/app/twa/`:
- Compact layout
- Native Telegram styling
- Touch-optimized interactions
- Use `window.Telegram.WebApp` for native features

Key files:
- `/src/app/twa/page.tsx` - Main Mini App
- `/src/app/twa/layout.tsx` - TWA-specific layout
- `/src/components/twa/` - TWA-specific components

---

## Deployment

The Telegram bot needs a webhook or long-polling setup:

**Development (long-polling):**
```typescript
bot.launch();
```

**Production (webhook):**
```typescript
// Set webhook URL
await bot.telegram.setWebhook('https://your-domain.com/api/telegram/webhook');

// Handle in API route
export async function POST(req: Request) {
  await bot.handleUpdate(await req.json());
  return new Response('OK');
}
```

---

## Testing

Test each command manually in Telegram:
1. `/start` - Bot responds with welcome
2. `/garden` - Shows empty garden
3. `/plant Test idea` - Prompts for origin
4. Reply with origin - Confirms planted
5. `/garden` - Shows seed in Seeds section
6. `/water Test idea` - Prompts for thought
7. Reply with thought - Shows progress
8. Repeat until 5 waterings
9. `/harvest Test idea` - Confirms harvest
