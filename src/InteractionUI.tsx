import { useEffect } from 'react';
import { useInteractionStore } from './stores/interactionStore';

function InteractionUI() {
    const { objectName, highlightedObject } =
        useInteractionStore();

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'e') {
                // Check if the object has a custom interaction handler
                if (
                    highlightedObject &&
                    highlightedObject.userData &&
                    highlightedObject.userData.onInteract
                ) {
                    highlightedObject.userData.onInteract();
                    return;
                }
            }
        }
    });
}

export default InteractionUI;
