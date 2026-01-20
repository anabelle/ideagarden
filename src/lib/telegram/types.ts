export interface SessionData {
    pendingAction?: {
        type: 'plant' | 'water';
        title?: string;
    };
}

export interface BotContext {
    session?: SessionData; // Making it optional to match simpler Telegraf types or needs middleware
}
