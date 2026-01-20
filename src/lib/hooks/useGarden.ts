import { useEffect } from 'react';
import useSWR from 'swr';
import { GardenOverview } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const GARDEN_CHANNEL = 'garden-updates';

export function notifyGardenUpdate() {
    // Notify other tabs
    const channel = new BroadcastChannel(GARDEN_CHANNEL);
    channel.postMessage({ type: 'REFRESH' });
    channel.close();
}

export function useGarden(userId?: string) {
    // If userId is provided (testing), append it to query params
    const endpoint = userId
        ? `/api/garden?userId=${userId}`
        : '/api/garden';

    const { data, error, mutate, isLoading } = useSWR<GardenOverview>(endpoint, fetcher, {
        refreshInterval: 15000, // Reduced to 15s
        revalidateOnFocus: true,
    });

    // Listen for cross-tab updates
    useEffect(() => {
        const channel = new BroadcastChannel(GARDEN_CHANNEL);
        channel.onmessage = (event) => {
            if (event.data.type === 'REFRESH') {
                mutate();
            }
        };
        return () => channel.close();
    }, [mutate]);

    return {
        garden: data,
        isLoading,
        isError: error,
        refresh: mutate,
    };
}
