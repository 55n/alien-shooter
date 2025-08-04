import { create } from 'zustand';
import { Vector3 } from 'three';
import { Object3D } from 'three';

interface PlayerState {
    // Player reference
    playerRef: Object3D | null;
    setPlayerRef: (ref: Object3D | null) => void;

    // Player position
    position: Vector3 | null;
    setPosition: (position: Vector3) => void;

    // Player movement state
    isGrounded: boolean;
    setIsGrounded: (grounded: boolean) => void;

    // Movement controls
    keys: Record<string, boolean>;
    setKey: (key: string, pressed: boolean) => void;
    
    // Player settings
    speed: number;
    setSpeed: (speed: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    // Player reference
    playerRef: null,
    setPlayerRef: (ref) => set({ playerRef: ref }),

    // Player position
    position: null,
    setPosition: (position) => set({ position: position.clone() }),

    // Player movement state
    isGrounded: false,
    setIsGrounded: (grounded) => set({ isGrounded: grounded }),

    // Movement controls
    keys: {},
    setKey: (key, pressed) => set((state) => ({
        keys: { ...state.keys, [key]: pressed }
    })),

    // Player settings
    speed: 10,
    setSpeed: (speed) => set({ speed }),
}));