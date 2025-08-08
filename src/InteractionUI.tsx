import { useEffect } from 'react';
import { useInteractionStore } from './stores/interactionStore';

function InteractionUI() {
    const { canInteract, objectName, objectDistance, isInRange, highlightedObject } =
        useInteractionStore();

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'e' && canInteract && isInRange) {
                // Check if the object has a custom interaction handler
                if (
                    highlightedObject &&
                    highlightedObject.userData &&
                    highlightedObject.userData.onInteract
                ) {
                    highlightedObject.userData.onInteract();
                    return;
                }

                const isNPC =
                    objectName === 'NPC' ||
                    objectName.includes('Guard') ||
                    objectName.includes('Merchant');
                if (isNPC) {
                    console.log(
                        `Talking to ${objectName}... (Distance: ${objectDistance.toFixed(2)})`
                    );
                    console.log(`${objectName}: "Hello there, traveler!"`);
                } else {
                    console.log(
                        `Opening ${objectName}... (Distance: ${objectDistance.toFixed(2)})`
                    );
                }
                // TODO: Add actual interaction logic here
            } else if (event.key.toLowerCase() === 'e' && canInteract && !isInRange) {
                console.log(
                    `Too far away! Get closer to the ${objectName}. (Distance: ${objectDistance.toFixed(2)}, Max: 5.0)`
                );
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [canInteract, objectName, objectDistance, isInRange, highlightedObject]);

    if (!canInteract) return null;

    return <>{canInteract && <InteractionUI />}</>;
}

export default InteractionUI;
