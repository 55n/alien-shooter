import { useEffect } from 'react';
import { useDebugStore } from './stores/debugStore';
import { useCameraStore } from './stores/cameraStore';

function DebugPanel() {
    const { 
        isVisible, 
        toggleVisibility, 
        playerPosition, 
        cameraDirection,
        velocity,
        isGrounded,
        frameRate,
        canJump,
        groundDistance
    } = useDebugStore();
    
    const { mode } = useCameraStore();

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'F3') {
                event.preventDefault();
                toggleVisibility();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [toggleVisibility]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px 15px',
            fontFamily: 'monospace',
            fontSize: '12px',
            borderRadius: '4px',
            zIndex: 1000,
            pointerEvents: 'none',
            minWidth: '200px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <div style={{ 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#00ff00'
            }}>
                DEBUG PANEL (F3 to toggle)
            </div>
            
            <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#ffaa00' }}>Camera Mode:</span>
            </div>
            <div style={{ marginLeft: '10px', marginBottom: '8px' }}>
                <span style={{ color: mode === 'first-person' ? '#00ff00' : '#ff6666' }}>
                    {mode === 'first-person' ? 'First Person' : 'Third Person'}
                </span>
                <div style={{ fontSize: '10px', color: '#888' }}>Press 'C' to toggle</div>
            </div>
            
            <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#ffaa00' }}>Player Position:</span>
            </div>
            <div style={{ marginLeft: '10px', marginBottom: '8px' }}>
                {playerPosition ? (
                    <>
                        <div>x: {playerPosition.x.toFixed(2)}</div>
                        <div>y: {playerPosition.y.toFixed(2)}</div>
                        <div>z: {playerPosition.z.toFixed(2)}</div>
                    </>
                ) : (
                    <div style={{ color: '#666' }}>No data</div>
                )}
            </div>

            <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#ffaa00' }}>Camera Direction:</span>
            </div>
            <div style={{ marginLeft: '10px', marginBottom: '8px' }}>
                {cameraDirection ? (
                    <>
                        <div>x: {cameraDirection.x.toFixed(2)}</div>
                        <div>y: {cameraDirection.y.toFixed(2)}</div>
                        <div>z: {cameraDirection.z.toFixed(2)}</div>
                    </>
                ) : (
                    <div style={{ color: '#666' }}>No data</div>
                )}
            </div>

            {velocity && (
                <>
                    <div style={{ marginBottom: '4px' }}>
                        <span style={{ color: '#ffaa00' }}>Velocity:</span>
                    </div>
                    <div style={{ marginLeft: '10px', marginBottom: '8px' }}>
                        <div>x: {velocity.x.toFixed(2)}</div>
                        <div>y: {velocity.y.toFixed(2)}</div>
                        <div>z: {velocity.z.toFixed(2)}</div>
                    </div>
                </>
            )}

            <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#ffaa00' }}>Status:</span>
            </div>
            <div style={{ marginLeft: '10px', marginBottom: '8px' }}>
                <div>Grounded: <span style={{ color: isGrounded ? '#00ff00' : '#ff6666' }}>
                    {isGrounded ? 'Yes' : 'No'}
                </span></div>
                <div>Can Jump: <span style={{ color: canJump ? '#00ff00' : '#ff6666' }}>
                    {canJump ? 'Yes' : 'No'}
                </span></div>
                {velocity && (
                    <div>Y-Vel: {velocity.y.toFixed(3)}</div>
                )}
                {playerPosition && (
                    <div>Height: {playerPosition.y.toFixed(3)}</div>
                )}
                <div>Ground Dist: {groundDistance === Infinity ? 'No Ground' : groundDistance.toFixed(3)} (Max: 1.3)</div>
                {frameRate > 0 && (
                    <div>FPS: {frameRate.toFixed(0)}</div>
                )}
                <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
                    Press SPACE to jump • Ground detection: Raycast
                </div>
            </div>
        </div>
    );
}

export default DebugPanel;