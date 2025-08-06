import { useEffect } from 'react';
import { useCameraStore } from '../stores/cameraStore';
import UnifiedCameraControls from './UnifiedCameraControls';

function CameraControls() {
    const { toggleMode, updateSpherical, radiusStep } = useCameraStore();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            console.log('Key pressed in CameraControls:', event.code);
            
            // Toggle camera mode with 'C' key (smoothly transition to third person)
            if (event.code === 'KeyC') {
                event.preventDefault();
                console.log('Toggling camera mode');
                toggleMode();
            }

            // Alternative radius controls for when mouse wheel isn't available
            if (event.code === 'KeyR' && event.shiftKey) {
                event.preventDefault();
                console.log('Zoom in (Shift+R)');
                updateSpherical(-radiusStep, 0, 0); // Zoom in (Shift+R)
            } else if (event.code === 'KeyR') {
                event.preventDefault();
                console.log('Zoom out (R)');
                updateSpherical(radiusStep, 0, 0); // Zoom out (R)
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [toggleMode, updateSpherical, radiusStep]);

    return <UnifiedCameraControls />;
}

export default CameraControls;
