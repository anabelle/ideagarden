import { NextRequest, NextResponse } from 'next/server';
import { bot } from '@/lib/telegram/bot';
import '@/lib/telegram'; // Ensure commands are registered

export async function POST(req: NextRequest) {
    if (!bot) {
        return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
    }

    try {
        const body = await req.json();
        await bot.handleUpdate(body);
        return new NextResponse('OK');
    } catch (error) {
        console.error('Error handling Telegram update:', error);
        return NextResponse.json({ error: 'Error handling update' }, { status: 500 });
    }
}
