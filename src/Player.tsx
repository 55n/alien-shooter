import { useThree } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import { forwardRef, useEffect, useRef } from 'react';
import { Object3D, Raycaster, Vector3 } from 'three';
import CharacterBody from './CharacterBody';
import { useDebugStore } from './stores/debugStore';
import { usePlayerStore } from './stores/playerStore';

interface PlayerProps {
    position?: [number, number, number];
    radius?: number;
    height?: number;
    mass?: number;
}

const Player = forwardRef<Object3D, PlayerProps>(
    ({ position = [0, 1, 0], radius = 0.3, height = 1.8, mass = 1 }, ref) => {
        const { camera, scene } = useThree();

        // Zustand stores
        const { keys, setKey, speed, setPlayerRef, setPosition, setIsGrounded } = usePlayerStore();

        const {
            setPlayerPosition,
            setVelocity,
            setIsGrounded: setDebugIsGrounded,
            setCanJump: setDebugCanJump,
            setGroundDistance,
        } = useDebugStore();

        // Player-specific refs
        const canJumpRef = useRef(false);
        const velocityRef = useRef<[number, number, number]>([0, 0, 0]);
        const debugUpdateCounter = useRef(0);
        const groundRaycaster = useRef(new Raycaster());
        const velocityCleanupCounter = useRef(0);

        const tempForward = useRef(new Vector3());
        const tempRight = useRef(new Vector3());
        const tempMove = useRef(new Vector3());
        const up = useRef(new Vector3(0, 1, 0));

        플레이어 메쉬 로딩해야 함

        // Player input handling
        useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                setKey(event.code.toLowerCase(), true);
            };

            const handleKeyUp = (event: KeyboardEvent) => {
                setKey(event.code.toLowerCase(), false);
            };

            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('keyup', handleKeyUp);
            };
        }, [setKey]);

        // Player physics update callback
        const handlePlayerUpdate = (bodyRef: CANNON.Body) => {
            // Update position in store
            setPosition(bodyRef.position);

            // Update velocity reference
            velocityRef.current = [bodyRef.velocity.x, bodyRef.velocity.y, bodyRef.velocity.z];

            // Handle player movement
            camera.getWorldDirection(tempForward.current);
            tempForward.current.y = 0;
            tempForward.current.normalize();

            tempRight.current.crossVectors(tempForward.current, up.current).normalize();
            tempMove.current.set(0, 0, 0);

            if (keys.keyw || keys.arrowup) {
                tempMove.current.add(tempForward.current);
            }
            if (keys.keys || keys.arrowdown) {
                tempMove.current.sub(tempForward.current);
            }
            if (keys.keya || keys.arrowleft) {
                tempMove.current.sub(tempRight.current);
            }
            if (keys.keyd || keys.arrowright) {
                tempMove.current.add(tempRight.current);
            }

            // Handle jumping (Space key)
            if (keys.space && canJumpRef.current) {
                bodyRef.velocity.set(velocityRef.current[0], 8, velocityRef.current[2]);
                canJumpRef.current = false;
                setIsGrounded(false);
                setDebugCanJump(false);
            }

            // Apply movement
            if (tempMove.current.lengthSq() > 0) {
                tempMove.current.normalize().multiplyScalar(speed);
                bodyRef.velocity.set(
                    tempMove.current.x,
                    velocityRef.current[1],
                    tempMove.current.z
                );
                bodyRef.linearDamping = 0.02;
            } else {
                bodyRef.linearDamping = 0.8;

                const currentVel = velocityRef.current;
                const threshold = 0.02;
                if (Math.abs(currentVel[0]) < threshold && Math.abs(currentVel[2]) < threshold) {
                    bodyRef.velocity.set(0, currentVel[1], 0);
                }
            }

            // Ground detection (simplified)
            const rayOrigin = new Vector3(
                meshRef.position.x,
                meshRef.position.y,
                meshRef.position.z
            );
            const rayDirection = new Vector3(0, -1, 0);
            groundRaycaster.current.set(rayOrigin, rayDirection);

            const intersects = groundRaycaster.current.intersectObjects(scene.children, true);
            const groundIntersects = intersects.filter((intersect) => {
                let obj = intersect.object;
                while (obj.parent) {
                    if (obj === meshRef || obj.parent === meshRef) {
                        return false;
                    }
                    obj = obj.parent;
                }
                return true;
            });

            const isGrounded =
                groundIntersects.length > 0 &&
                groundIntersects[0].distance <= 1.3 &&
                velocityRef.current[1] <= 1.5;

            if (isGrounded) {
                canJumpRef.current = true;
                setIsGrounded(true);
                setDebugIsGrounded(true);
                setDebugCanJump(true);
            } else {
                setIsGrounded(false);
                setDebugIsGrounded(false);
                setDebugCanJump(false);
            }

            // Update player ref and debug info
            setPlayerRef(meshRef);

            debugUpdateCounter.current++;
            if (debugUpdateCounter.current % 3 === 0) {
                setPlayerPosition(meshRef.position);
                setVelocity(new Vector3(...velocityRef.current));
                setGroundDistance(
                    groundIntersects.length > 0 ? groundIntersects[0].distance : Infinity
                );
            }
        };

        return (
            <CharacterBody
                ref={ref}
                position={position}
                radius={radius}
                height={height}
                mass={mass}
                material={{ friction: 0.6, restitution: 0.01 }}
                onUpdate={handlePlayerUpdate}
            />
        );
    }
);

Player.displayName = 'Player';

export default Player;
