/**
 * 🌱 SeedCard Component
 * 
 * Displays a single seed in the garden with its status,
 * watering count, and action buttons.
 */

import styles from './SeedCard.module.css';
import type { Seed } from '@/types';

interface SeedCardProps {
    seed: Seed;
    onWater?: (seedId: string) => void;
    onHarvest?: (seedId: string) => void;
    onCompost?: (seedId: string) => void;
    onClick?: (seedId: string) => void;
}

// Emoji for each section
const sectionEmoji: Record<Seed['section'], string> = {
    SEEDS: '🌱',
    SPROUTING: '🌿',
    READY_TO_HARVEST: '🌾',
    COMPOST: '🍂',
};

export function SeedCard({
    seed,
    onWater,
    onHarvest,
    onCompost,
    onClick
}: SeedCardProps) {
    const isHarvestable = seed.section === 'READY_TO_HARVEST';

    return (
        <div
            className={`glass-card ${styles.card} ${isHarvestable ? styles.harvestable : ''}`}
            onClick={() => onClick?.(seed.id)}
            role="button"
            tabIndex={0}
        >
            <div className={styles.header}>
                <span className={styles.emoji}>{sectionEmoji[seed.section]}</span>
                <span className={styles.waterings}>
                    💧 {seed.waterings}
                </span>
            </div>

            <h3 className={styles.title}>{seed.title}</h3>

            <p className={styles.origin}>{seed.origin}</p>

            <div className={styles.actions}>
                {seed.status === 'ACTIVE' && !isHarvestable && (
                    <button
                        className="btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onWater?.(seed.id);
                        }}
                    >
                        💧 Water
                    </button>
                )}

                {isHarvestable && (
                    <button
                        className="btn btn--primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onHarvest?.(seed.id);
                        }}
                    >
                        🌾 Harvest
                    </button>
                )}

                {seed.status === 'ACTIVE' && (
                    <button
                        className={`btn ${styles.compostBtn}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCompost?.(seed.id);
                        }}
                    >
                        🍂
                    </button>
                )}
            </div>
        </div>
    );
}

export default SeedCard;
