import { create } from 'zustand';

export enum Pose {
    STAND = 0,
    CROUCH = 1,
    CRAWL = 2,
}

interface HeroState {
    health: number;
    setHealth: (factor: number) => void;

    bodyTemperature: number;
    setBodyTemperature: (factor: number) => void;

    pose: Pose.STAND | Pose.CROUCH | Pose.CRAWL;
    setPose: (pose: Pose) => void;
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

    pose: Pose.STAND,
    setPose(pose) {
        set({ pose: pose });
    },
}));
