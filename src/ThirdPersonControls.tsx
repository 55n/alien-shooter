import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Vector3 } from 'three';
import { useCameraStore } from './stores/cameraStore';
import { useDebugStore } from './stores/debugStore';
import { usePlayerStore } from './stores/playerStore';

function ThirdPersonControls() {
    const { camera, gl } = useThree();
    
    // Zustand stores
    const { playerRef, position: playerPosition } = usePlayerStore();
    const { 
        rotation,
        updateRotation,
        sensitivity,
        offset,
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

        // Use the position from the store (which is updated from physics)
        const targetPosition = playerPosition;

        const radius = Math.abs(offset.z);
        const x = radius * Math.sin(rotation.phi) * Math.sin(rotation.theta);
        const y = radius * Math.cos(rotation.phi);
        const z = radius * Math.sin(rotation.phi) * Math.cos(rotation.theta);

        const cameraOffset = new Vector3(x, y, z);
        const cameraPosition = new Vector3().copy(targetPosition).add(cameraOffset);

        camera.position.copy(cameraPosition);
        camera.lookAt(targetPosition);

        // Update camera direction in stores
        const direction = new Vector3();
        camera.getWorldDirection(direction);
        setDirection(direction);
        setCameraDirection(direction);
    });

    return null;
}

export default ThirdPersonControls;
