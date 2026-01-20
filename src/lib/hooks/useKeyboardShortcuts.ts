import { useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutMap {
    [key: string]: KeyHandler;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if typing in an input
            if (
                ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName) ||
                (event.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            const key = event.key.toLowerCase();
            const handler = shortcuts[key] || shortcuts[event.key];

            if (handler) {
                // Prevent default if it's a known shortcut (optional, maybe not for strict single keys)
                // event.preventDefault(); 
                handler(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}
