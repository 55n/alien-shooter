import { create } from 'zustand';
import { Vector3 } from 'three';

type CameraMode = 'first-person' | 'third-person';

interface CameraState {
    // Camera mode
    mode: CameraMode;
    setMode: (mode: CameraMode) => void;
    toggleMode: () => void;

    // Camera direction
    direction: Vector3 | null;
    setDirection: (direction: Vector3) => void;

    // Camera rotation for both first and third person
    rotation: {
        theta: number;  // horizontal rotation (yaw)
        phi: number;    // vertical rotation (pitch)
    };
    setRotation: (theta: number, phi: number) => void;
    updateRotation: (deltaTheta: number, deltaPhi: number) => void;

    // Camera settings
    sensitivity: number;
    setSensitivity: (sensitivity: number) => void;

    offset: Vector3;
    setOffset: (offset: Vector3) => void;

    // Camera lock state
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;

    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}

export const useCameraStore = create<CameraState>((set, get) => ({
    // Camera mode
    mode: 'first-person',
    setMode: (mode) => set({ mode }),
    toggleMode: () => set((state) => ({ 
        mode: state.mode === 'first-person' ? 'third-person' : 'first-person' 
    })),

    // Camera direction
    direction: null,
    setDirection: (direction) => set({ direction: direction.clone() }),

    // Camera rotation
    rotation: {
        theta: 0,
        phi: 0  // Start level for first person
    },
    setRotation: (theta, phi) => set({ 
        rotation: { theta, phi } 
    }),
    updateRotation: (deltaTheta, deltaPhi) => set((state) => {
        const newPhi = state.rotation.phi + deltaPhi;
        // Clamp pitch for both first and third person
        const maxPhi = Math.PI / 2 - 0.1;
        const minPhi = -Math.PI / 2 + 0.1;
        const clampedPhi = Math.max(minPhi, Math.min(maxPhi, newPhi));

        return {
            rotation: {
                theta: state.rotation.theta + deltaTheta,
                phi: clampedPhi
            }
        };
    }),

    // Camera settings
    sensitivity: 0.002,
    setSensitivity: (sensitivity) => set({ sensitivity }),

    offset: new Vector3(0, 2, -5),  // For third person mode
    setOffset: (offset) => set({ offset: offset.clone() }),

    // Camera lock state
    isLocked: false,
    setIsLocked: (locked) => set({ isLocked: locked }),

    enabled: true,
    setEnabled: (enabled) => set({ enabled }),
}));