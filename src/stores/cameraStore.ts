import { Vector3 } from 'three';
import { create } from 'zustand';

type CameraMode = 'first-person' | 'third-person';

interface CameraState {
    // Camera mode
    mode: CameraMode;
    setMode: (mode: CameraMode) => void;
    toggleMode: () => void;

    // Camera direction
    direction: Vector3 | null;
    setDirection: (direction: Vector3) => void;

    // Spherical coordinates for unified camera system
    spherical: {
        radius: number; // Distance from target (0 = first person, >0 = third person)
        theta: number; // Horizontal angle (azimuth/yaw)
        phi: number; // Vertical angle (elevation/pitch)
    };
    setSpherical: (radius: number, theta: number, phi: number) => void;
    updateSpherical: (deltaRadius: number, deltaTheta: number, deltaPhi: number) => void;

    // Legacy rotation for backward compatibility
    rotation: {
        theta: number;
        phi: number;
    };
    setRotation: (theta: number, phi: number) => void;
    updateRotation: (deltaTheta: number, deltaPhi: number) => void;

    // Camera settings
    sensitivity: number;
    setSensitivity: (sensitivity: number) => void;

    // Radius limits and steps for smooth transitions
    minRadius: number;
    maxRadius: number;
    radiusStep: number;
    setRadiusLimits: (min: number, max: number, step: number) => void;

    // Eye height for first person
    eyeHeight: number;
    setEyeHeight: (height: number) => void;

    // Camera lock state
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;

    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}

export const useCameraStore = create<CameraState>((set, _get) => ({
    // Camera mode
    mode: 'first-person',
    setMode: (mode) => set({ mode }),
    toggleMode: () =>
        set((state) => ({
            mode: state.mode === 'first-person' ? 'third-person' : 'first-person',
            spherical: {
                ...state.spherical,
                radius: state.mode === 'first-person' ? 5 : 0, // Switch radius when toggling
            },
        })),

    // Camera direction
    direction: null,
    setDirection: (direction) => set({ direction: direction.clone() }),

    // Spherical coordinates
    spherical: {
        radius: 0, // Start in first person mode
        theta: 0, // Horizontal angle (yaw)
        phi: 0, // Vertical angle (pitch)
    },
    setSpherical: (radius, theta, phi) =>
        set((_state) => ({
            spherical: { radius, theta, phi },
            // Update mode based on radius
            mode: radius <= 0.1 ? 'first-person' : 'third-person',
            // Keep legacy rotation in sync
            rotation: { theta, phi },
        })),
    updateSpherical: (deltaRadius, deltaTheta, deltaPhi) =>
        set((state) => {
            const newRadius = Math.max(
                state.minRadius,
                Math.min(state.maxRadius, state.spherical.radius + deltaRadius)
            );
            const newTheta = state.spherical.theta + deltaTheta;
            const newPhi = state.spherical.phi + deltaPhi;

            // Clamp pitch
            const maxPhi = Math.PI / 2 - 0.1;
            const minPhi = -Math.PI / 2 + 0.1;
            const clampedPhi = Math.max(minPhi, Math.min(maxPhi, newPhi));

            return {
                spherical: {
                    radius: newRadius,
                    theta: newTheta,
                    phi: clampedPhi,
                },
                // Update mode based on radius
                mode: newRadius <= 0.1 ? 'first-person' : 'third-person',
                // Keep legacy rotation in sync
                rotation: { theta: newTheta, phi: clampedPhi },
            };
        }),

    // Legacy rotation for backward compatibility
    rotation: {
        theta: 0,
        phi: 0,
    },
    setRotation: (theta, phi) =>
        set((state) => ({
            rotation: { theta, phi },
            spherical: { ...state.spherical, theta, phi },
        })),
    updateRotation: (deltaTheta, deltaPhi) =>
        set((state) => {
            const newTheta = state.rotation.theta + deltaTheta;
            const newPhi = state.rotation.phi + deltaPhi;

            // Clamp pitch
            const maxPhi = Math.PI / 2 - 0.1;
            const minPhi = -Math.PI / 2 + 0.1;
            const clampedPhi = Math.max(minPhi, Math.min(maxPhi, newPhi));

            return {
                rotation: { theta: newTheta, phi: clampedPhi },
                spherical: { ...state.spherical, theta: newTheta, phi: clampedPhi },
            };
        }),

    // Camera settings
    sensitivity: 0.002,
    setSensitivity: (sensitivity) => set({ sensitivity }),

    // Radius limits and steps
    minRadius: 0,
    maxRadius: 10,
    radiusStep: 0.5,
    setRadiusLimits: (min, max, step) => set({ minRadius: min, maxRadius: max, radiusStep: step }),

    // Eye height for first person
    eyeHeight: 1.4,
    setEyeHeight: (height) => set({ eyeHeight: height }),

    // Camera lock state
    isLocked: false,
    setIsLocked: (locked) => set({ isLocked: locked }),

    enabled: true,
    setEnabled: (enabled) => set({ enabled }),
}));
