import useSWR from 'swr';
import { GardenOverview } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGarden(userId?: string) {
    // If userId is provided (testing), append it to query params
    const endpoint = userId
        ? `/api/garden?userId=${userId}`
        : '/api/garden';

    const { data, error, mutate, isLoading } = useSWR<GardenOverview>(endpoint, fetcher, {
        refreshInterval: 30000, // Refresh every 30s
        revalidateOnFocus: true,
    });

    return {
        garden: data,
        isLoading,
        isError: error,
        refresh: mutate,
    };
}
