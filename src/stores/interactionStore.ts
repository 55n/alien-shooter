import { create } from 'zustand';
import { Mesh } from 'three';

interface InteractionState {
    // Currently highlighted object
    highlightedObject: Mesh | null;
    setHighlightedObject: (object: Mesh | null) => void;

    // Interaction availability
    canInteract: boolean;
    setCanInteract: (canInteract: boolean) => void;

    // Distance information
    objectDistance: number;
    setObjectDistance: (distance: number) => void;
    isInRange: boolean;
    setIsInRange: (inRange: boolean) => void;

    // Object information
    objectName: string;
    setObjectName: (name: string) => void;
}

export const useInteractionStore = create<InteractionState>((set, _get) => ({
    // Currently highlighted object
    highlightedObject: null,
    setHighlightedObject: (object) => set({ highlightedObject: object }),

    // Interaction availability
    canInteract: false,
    setCanInteract: (canInteract) => set({ canInteract }),

    // Distance information
    objectDistance: Infinity,
    setObjectDistance: (distance) => set({ objectDistance: distance }),
    isInRange: false,
    setIsInRange: (inRange) => set({ isInRange: inRange }),

    // Object information
    objectName: '',
    setObjectName: (name) => set({ objectName: name }),
}));
