import { create } from 'zustand';
import { Vector3 } from 'three';

interface DebugState {
    // Debug panel visibility
    isVisible: boolean;
    setIsVisible: (visible: boolean) => void;
    toggleVisibility: () => void;

    // Debug data
    playerPosition: Vector3 | null;
    setPlayerPosition: (position: Vector3) => void;

    cameraDirection: Vector3 | null;
    setCameraDirection: (direction: Vector3) => void;

    // Additional debug info
    velocity: Vector3 | null;
    setVelocity: (velocity: Vector3) => void;

    isGrounded: boolean;
    setIsGrounded: (grounded: boolean) => void;

    frameRate: number;
    setFrameRate: (fps: number) => void;
}

export const useDebugStore = create<DebugState>((set, get) => ({
    // Debug panel visibility
    isVisible: true,
    setIsVisible: (visible) => set({ isVisible: visible }),
    toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),

    // Debug data
    playerPosition: null,
    setPlayerPosition: (position) => set({ playerPosition: position.clone() }),

    cameraDirection: null,
    setCameraDirection: (direction) => set({ cameraDirection: direction.clone() }),

    // Additional debug info
    velocity: null,
    setVelocity: (velocity) => set({ velocity: velocity.clone() }),

    isGrounded: false,
    setIsGrounded: (grounded) => set({ isGrounded: grounded }),

    frameRate: 0,
    setFrameRate: (fps) => set({ frameRate: fps }),
}));