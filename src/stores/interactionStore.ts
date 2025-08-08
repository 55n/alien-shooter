import { Mesh } from 'three';
import { create } from 'zustand';

interface InteractionState {
    // Currently highlighted object
    highlightedObject: Mesh | null;
    setHighlightedObject: (object: Mesh | null) => void;

    // Object information
    objectName: string;
    setObjectName: (name: string) => void;
}

export const useInteractionStore = create<InteractionState>((set, _get) => ({
    // Currently highlighted object
    highlightedObject: null,
    setHighlightedObject: (object) => set({ highlightedObject: object }),

    // Object information
    objectName: '',
    setObjectName: (name) => set({ objectName: name }),
}));
