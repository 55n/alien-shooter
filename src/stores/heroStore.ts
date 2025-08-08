import { create } from 'zustand';

interface HeroState {
    health: number;
    setHealth: (factor: number) => void;

    bodyTemperature: number;
    setBodyTemperature: (factor: number) => void;
}

export const useHeroStore = create<HeroState>((set, get) => ({
    health: 100,
    setHealth(factor) {
        const currentHealth = get().health;
        const newHealth = Math.max(0, Math.min(100, currentHealth + factor));

        set({ health: newHealth });
    },

    bodyTemperature: 36.5,
    setBodyTemperature(factor) {
        const currentTemp = get().bodyTemperature;
        const newTemp = Math.max(30, Math.min(45, currentTemp + factor)); // 합리적인 체온 범위

        set({ bodyTemperature: newTemp });
    },
}));
