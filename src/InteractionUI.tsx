import { useEffect } from 'react';
import { useInteractionStore } from './stores/interactionStore';

function InteractionUI() {
    const { canInteract, objectName, objectDistance, isInRange, highlightedObject } = useInteractionStore();

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'e' && canInteract && isInRange) {
                // Check if the object has a custom interaction handler
                if (highlightedObject && highlightedObject.userData && highlightedObject.userData.onInteract) {
                    highlightedObject.userData.onInteract();
                    return;
                }
                
                const isNPC = objectName === 'NPC' || objectName.includes('Guard') || objectName.includes('Merchant');
                if (isNPC) {
                    console.log(`Talking to ${objectName}... (Distance: ${objectDistance.toFixed(2)})`);
                    console.log(`${objectName}: "Hello there, traveler!"`);
                } else {
                    console.log(`Opening ${objectName}... (Distance: ${objectDistance.toFixed(2)})`);
                }
                // TODO: Add actual interaction logic here
            } else if (event.key.toLowerCase() === 'e' && canInteract && !isInRange) {
                console.log(`Too far away! Get closer to the ${objectName}. (Distance: ${objectDistance.toFixed(2)}, Max: 5.0)`);
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [canInteract, objectName, objectDistance, isInRange, highlightedObject]);

    if (!canInteract) return null;

    return (
        <>
            { 
                canInteract &&
                (
                    <>
                        <div style={{
                            position: 'fixed',
                            top: '60%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            pointerEvents: 'none',
                            zIndex: 999,
                            textAlign: 'center'
                        }}>
                            {/* Interaction prompt */}
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.8)',
                                color: 'white',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                border: `2px solid ${isInRange ? '#0066ff' : '#ff6666'}`,
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                boxShadow: `0 4px 12px ${isInRange ? 'rgba(0, 102, 255, 0.3)' : 'rgba(255, 102, 102, 0.3)'}`,
                                animation: isInRange ? 'pulse 2s infinite' : 'none'
                            }}>
                                <div style={{ marginBottom: '4px', color: isInRange ? '#00aaff' : '#ffaaaa' }}>
                                    {objectName || 'Object'}
                                </div>
                                <div style={{ fontSize: '10px', marginBottom: '6px', color: '#cccccc' }}>
                                    Distance: {objectDistance.toFixed(1)}m {isInRange ? '(In Range)' : '(Too Far)'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <div style={{
                                        background: isInRange ? '#0066ff' : '#666666',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        E
                                    </div>
                                    <span style={{ color: isInRange ? 'white' : '#aaaaaa' }}>
                                        {isInRange ? 
                                            (objectName === 'NPC' || objectName.includes('Guard') || objectName.includes('Merchant') ? 'TALK' : 'OPEN') 
                                            : 'TOO FAR'
                                        }
                                    </span>
                                </div>
                            </div>

                            <style>
                                {`
                                    @keyframes pulse {
                                        0% { box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3); }
                                        50% { box-shadow: 0 4px 20px rgba(0, 102, 255, 0.6); }
                                        100% { box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3); }
                                    }
                                `}
                            </style>
                        </div>
                    </>
                )
            }
        </>
        
    );
}

export default InteractionUI;