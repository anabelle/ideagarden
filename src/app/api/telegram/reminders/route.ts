import { NextRequest, NextResponse } from 'next/server';
import '@/lib/telegram';
import { sendDailyReminders } from '@/lib/telegram/reminders';

export async function POST(req: NextRequest) {
    try {
        const auth = req.headers.get('authorization');
        const secret = process.env.REMINDERS_SECRET;

        if (secret) {
            if (!auth?.startsWith('Bearer ')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const token = auth.slice('Bearer '.length).trim();
            if (token !== secret) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const result = await sendDailyReminders();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error sending daily reminders:', error);
        return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
    }
}
