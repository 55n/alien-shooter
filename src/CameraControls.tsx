import { useEffect } from 'react';
import { useCameraStore } from './stores/cameraStore';
import FirstPersonControls from './FirstPersonControls';
import ThirdPersonControls from './ThirdPersonControls';

function CameraControls() {
    const { mode, toggleMode } = useCameraStore();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Toggle camera mode with 'C' key
            if (event.code === 'KeyC') {
                event.preventDefault();
                toggleMode();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [toggleMode]);

    return (
        <>
            {mode === 'first-person' ? (
                <FirstPersonControls />
            ) : (
                <ThirdPersonControls />
            )}
        </>
    );
}

export default CameraControls;