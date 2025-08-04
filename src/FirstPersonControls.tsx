import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Vector3, Euler } from 'three';
import { useCameraStore } from './stores/cameraStore';
import { useDebugStore } from './stores/debugStore';
import { usePlayerStore } from './stores/playerStore';

function FirstPersonControls() {
    const { camera, gl } = useThree();
    
    // Zustand stores
    const { playerRef, position: playerPosition } = usePlayerStore();
    const { 
        rotation,
        updateRotation,
        sensitivity,
        isLocked,
        setIsLocked,
        enabled,
        setDirection
    } = useCameraStore();
    const { setCameraDirection } = useDebugStore();

    const onPointerLockChange = () => {
        const locked = document.pointerLockElement === gl.domElement;
        setIsLocked(locked);
    };

    const onMouseMove = (event: MouseEvent) => {
        if (!enabled || !isLocked) return;

        updateRotation(-event.movementX * sensitivity, -event.movementY * sensitivity);
    };

    useEffect(() => {
        const domElement = gl.domElement;

        const handleClick = () => {
            domElement.requestPointerLock();
        };

        domElement.addEventListener('click', handleClick);
        document.addEventListener('pointerlockchange', onPointerLockChange);
        document.addEventListener('mousemove', onMouseMove);

        return () => {
            domElement.removeEventListener('click', handleClick);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
            document.removeEventListener('mousemove', onMouseMove);
        };
    }, [gl.domElement, enabled, sensitivity, isLocked, updateRotation, setIsLocked]);

    useFrame(() => {
        if (!enabled || !playerPosition) return;

        // Position camera at player position with height offset for domino
        const eyeHeight = 1.5; // Adjusted for domino height (1.8m tall)
        const cameraPosition = new Vector3(
            playerPosition.x,
            playerPosition.y + eyeHeight,
            playerPosition.z
        );

        camera.position.copy(cameraPosition);

        // Apply rotation to camera
        camera.rotation.set(rotation.phi, rotation.theta, 0, 'YXZ');

        // Update camera direction in stores
        const direction = new Vector3();
        camera.getWorldDirection(direction);
        setDirection(direction);
        setCameraDirection(direction);
    });

    return null;
}

export default FirstPersonControls;