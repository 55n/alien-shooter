import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Vector3 } from 'three';
import { useCameraStore } from '../stores/cameraStore';
import { useDebugStore } from '../stores/debugStore';
import { usePlayerStore } from '../stores/playerStore';

function UnifiedCameraControls() {
    const { camera, gl } = useThree();

    // Zustand stores
    const { position: playerPosition } = usePlayerStore();
    const {
        spherical,
        updateSpherical,
        sensitivity,
        isLocked,
        setIsLocked,
        enabled,
        setDirection,
        eyeHeight,
        radiusStep,
    } = useCameraStore();
    const { setCameraDirection } = useDebugStore();

    const onPointerLockChange = () => {
        const locked = document.pointerLockElement === gl.domElement;
        console.log('Pointer Lock Changed:', { locked, element: document.pointerLockElement });
        setIsLocked(locked);
    };

    const onMouseMove = (event: MouseEvent) => {
        if (!enabled || !isLocked) return;

        // Update spherical coordinates with mouse movement
        updateSpherical(0, -event.movementX * sensitivity, -event.movementY * sensitivity);
    };

    const onWheel = (event: WheelEvent) => {
        console.log('Wheel Event:', { enabled, isLocked, deltaY: event.deltaY });

        if (!enabled) {
            console.log('Wheel blocked - not enabled');
            return;
        }

        event.preventDefault();

        // Use wheel to adjust camera radius (zoom in/out) - Don't require pointer lock for wheel
        const deltaRadius = event.deltaY > 0 ? radiusStep : -radiusStep;
        console.log('Updating spherical radius:', { deltaRadius, currentRadius: spherical.radius });
        updateSpherical(deltaRadius, 0, 0);
    };

    useEffect(() => {
        const domElement = gl.domElement;

        const handleClick = () => {
            console.log('Canvas clicked, requesting pointer lock');
            domElement.requestPointerLock();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!enabled || !isLocked) return;

            // Use scroll wheel alternative keys for radius adjustment
            if (event.key === 'PageUp' || event.key === '+' || event.key === '=') {
                event.preventDefault();
                updateSpherical(-radiusStep, 0, 0); // Zoom in
            } else if (event.key === 'PageDown' || event.key === '-' || event.key === '_') {
                event.preventDefault();
                updateSpherical(radiusStep, 0, 0); // Zoom out
            }
        };

        domElement.addEventListener('click', handleClick);
        document.addEventListener('pointerlockchange', onPointerLockChange);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('wheel', onWheel, { passive: false });
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            domElement.removeEventListener('click', handleClick);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('wheel', onWheel);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [gl.domElement, enabled, sensitivity, isLocked, updateSpherical, setIsLocked, radiusStep]);

    useFrame(() => {
        if (!enabled) return;
        
        // If no player position yet, use default position
        if (!playerPosition) {
            console.log('No player position available yet, using default');
            return;
        }

        // Calculate camera position using spherical coordinates
        const { radius, theta, phi } = spherical;

        // Target position (player position)
        const target = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z);

        if (radius <= 0.1) {
            // First person mode: position camera at player's eye level
            const cameraPosition = new Vector3(target.x, target.y + eyeHeight, target.z);

            camera.position.copy(cameraPosition);

            // Apply rotation directly to camera for first person
            // Note: phi is pitch (up/down), theta is yaw (left/right)
            camera.rotation.set(phi, theta, 0, 'YXZ');
        } else {
            // Third person mode: use spherical coordinates properly
            // Convert spherical coordinates to Cartesian position
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            const y = radius * Math.cos(phi);

            // Position camera at spherical offset from target
            const cameraPosition = new Vector3(
                target.x + -x,
                target.y + -y + eyeHeight,
                target.z + z
            );

            camera.position.copy(cameraPosition);
            camera.lookAt(new Vector3(target.x, target.y + eyeHeight, target.z));
        }

        // Update camera matrix and direction
        camera.updateMatrixWorld();

        const direction = new Vector3();
        camera.getWorldDirection(direction);
        setDirection(direction);
        setCameraDirection(direction);
    });

    return null;
}

export default UnifiedCameraControls;
