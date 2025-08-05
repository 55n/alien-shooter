import type { Triplet } from '@react-three/cannon';
import { useBox } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Object3D, Raycaster, Vector3 } from 'three';
import { useCameraStore } from './stores/cameraStore';
import { useDebugStore } from './stores/debugStore';
import { usePlayerStore } from './stores/playerStore';

interface PlayerProps {
    position?: [number, number, number];
    size?: [number, number, number]; // width, height, depth
    mass?: number;
    color?: string;
}

const Player = (({
    position = [0, 0.8, 0],
    size = [0.6, 1.8, 0.3], // domino proportions: wider than deep, tall
    mass = 1,
    color = '#ffffff' // white like a domino
}: PlayerProps, ref: Object3D) => {
    const { camera, scene } = useThree();
    const { direction, rotation } = useCameraStore();
    
    // Zustand stores
    const { 
        keys, 
        setKey, 
        speed,
        setPlayerRef, 
        setPosition,
        setIsGrounded 
    } = usePlayerStore();
    
    const { 
        setPlayerPosition, 
        setVelocity, 
        setIsGrounded: setDebugIsGrounded, 
        setCanJump: setDebugCanJump, 
        setGroundDistance 
    } = useDebugStore();

    // Local component state only
    const canJumpRef = useRef(false);
    const velocityRef = useRef<Triplet>([0, 0, 0]);
    const debugUpdateCounter = useRef(0);
    const visualGroupRef = useRef<Object3D>(null);
    const groundRaycaster = useRef(new Raycaster());
    const velocityCleanupCounter = useRef(0);
    
    const [meshRef, api] = useBox(() => ({
        mass,
        position,
        args: size,
        material: {
            friction: 0.6, // Balanced for good control without excessive drag
            restitution: 0.01 // Minimal bounciness
        },
        angularFactor: [0, 0, 0], // Prevent all rotation (more precise than fixedRotation)
        linearDamping: 0.1, // Increased damping for better stopping
        angularDamping: 0.95
    }));

    const tempForward = useRef(new Vector3());
    const tempRight = useRef(new Vector3());
    const tempMove = useRef(new Vector3());
    const up = useRef(new Vector3(0, 1, 0));

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            setKey(event.code.toLowerCase(), true);
            
            if (event.code === 'Space' && canJumpRef.current) {
                console.log('JUMP! Current velocity:', velocityRef.current, 'Position:', meshRef.current?.position);
                // Preserve horizontal velocity when jumping
                api.velocity.set(
                    velocityRef.current[0],
                    8,
                    velocityRef.current[2]
                );
                canJumpRef.current = false;
                setIsGrounded(false);
                setDebugCanJump(false);
            }
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
    }, [api, setKey, setIsGrounded]);

    useEffect(() => {
        const unsubscribeVelocity = api.velocity.subscribe((velocity) => {
            velocityRef.current = velocity;
        });

        // Subscribe to position changes from physics body
        const unsubscribePosition = api.position.subscribe((position) => {
            if (meshRef.current) {
                // Directly set the mesh position from physics
                meshRef.current.position.fromArray(position);
                // Update position in store
                setPosition(meshRef.current.position);
            }
        });

        // Raycast-based ground detection
        const checkGrounded = () => {
            if (!meshRef.current) return;
            
            const position = meshRef.current.position;
            const verticalVelocity = velocityRef.current[1];
            
            // Set up raycast from player position downward
            const rayOrigin = new Vector3(position.x, position.y, position.z);
            const rayDirection = new Vector3(0, -1, 0); // Straight down
            
            groundRaycaster.current.set(rayOrigin, rayDirection);
            
            // Cast ray and check for intersections
            const intersects = groundRaycaster.current.intersectObjects(scene.children, true);
            
            // Filter out the player itself from intersections
            const groundIntersects = intersects.filter(intersect => {
                // Skip if the intersected object is part of the player
                let obj = intersect.object;
                while (obj.parent) {
                    if (obj === meshRef.current || obj.parent === meshRef.current) {
                        return false;
                    }
                    obj = obj.parent;
                }
                return true;
            });
            
            let isGrounded = false;
            let groundDistance = Infinity;
            
            if (groundIntersects.length > 0) {
                groundDistance = groundIntersects[0].distance;
                
                // Player is grounded if there's ground within a very generous distance
                // Player height is 1.8, so center to bottom is 0.9
                // Very increased tolerance to prevent bouncing on uneven surfaces
                const maxGroundDistance = 1.3; // Very generous detection range
                const isNotRisingFast = verticalVelocity <= 1.5; // Very permissive velocity check
                
                isGrounded = groundDistance <= maxGroundDistance && isNotRisingFast;
            }
            
            // Debug logging
            const wasGrounded = canJumpRef.current;
            if (isGrounded !== wasGrounded) {
                console.log('Ground state changed (raycast):', {
                    isGrounded,
                    groundDistance: groundDistance.toFixed(3),
                    maxDistance: 1.3,
                    verticalVelocity: verticalVelocity.toFixed(3),
                    intersectCount: groundIntersects.length,
                    playerY: position.y.toFixed(3)
                });
            }
            
            // Update debug info
            setGroundDistance(groundDistance);
            
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
        };
        
        const interval = setInterval(checkGrounded, 50); // Check more frequently

        return () => {
            unsubscribeVelocity();
            unsubscribePosition();
            clearInterval(interval);
        };
    }, [api, setIsGrounded]);

    useFrame(() => {
        if (!meshRef.current) return;

        camera.getWorldDirection(tempForward.current);
        // Flatten the forward vector to prevent flying when looking up/down
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

        if (tempMove.current.lengthSq() > 0) {
            tempMove.current.normalize().multiplyScalar(speed);
            
            // Set movement velocity - let physics handle deceleration
            api.velocity.set(
                tempMove.current.x,
                velocityRef.current[1],
                tempMove.current.z
            );
            
            // Reduce damping for responsive movement
            api.linearDamping.set(0.02);
        } else {
            // Increase damping to naturally stop horizontal movement
            api.linearDamping.set(0.8);
            
            // Eliminate tiny velocity drift caused by numerical precision
            const currentVel = velocityRef.current;
            const threshold = 0.02; // Increased threshold
            if (Math.abs(currentVel[0]) < threshold && Math.abs(currentVel[2]) < threshold) {
                api.velocity.set(0, currentVel[1], 0);
            }
        }

        // Update refs and global state
        if (ref && typeof ref !== 'function') {
            ref.current = meshRef.current;
        }

        if (meshRef.current) {
            // Update player ref in store
            setPlayerRef(meshRef.current);
            
            // Rotate visual mesh to follow camera direction (only Y-axis rotation)
            if (visualGroupRef.current) {
                visualGroupRef.current.rotation.y = rotation.theta;
            }
            
            // Periodic velocity cleanup to eliminate persistent drift
            velocityCleanupCounter.current++;
            if (velocityCleanupCounter.current % 30 === 0) { // Every 30 frames (~0.5 seconds)
                const vel = velocityRef.current;
                const threshold = 0.015;
                if (Math.abs(vel[0]) < threshold && Math.abs(vel[2]) < threshold) {
                    api.velocity.set(0, vel[1], 0);
                }
            }
            
            // Update debug info less frequently to reduce unnecessary re-renders
            debugUpdateCounter.current++;
            if (debugUpdateCounter.current % 3 === 0) {
                setPlayerPosition(meshRef.current.position);
                // Update velocity in debug panel
                const vel = new Vector3(velocityRef.current[0], velocityRef.current[1], velocityRef.current[2]);
                setVelocity(vel);
            }
        }
    });

    return (
        <group ref={meshRef}>
            {/* Visual representation - this will rotate */}
            <group ref={visualGroupRef}>
                {/* Main domino body */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={size} />
                    <meshStandardMaterial 
                        color={color}
                        roughness={0.3}
                        metalness={0.1}
                    />
                </mesh>
                
                {/* Black center line like a domino */}
                <mesh position={[0, 0, size[2]/2 + 0.001]} castShadow>
                    <boxGeometry args={[size[0] * 0.8, size[1] * 0.1, 0.002]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                
                {/* Dots on top half */}
                <mesh position={[-size[0]/4, size[1]/4, size[2]/2 + 0.002]} castShadow>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <mesh position={[size[0]/4, size[1]/4, size[2]/2 + 0.002]} castShadow>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                
                {/* Dots on bottom half */}
                <mesh position={[-size[0]/4, -size[1]/4, size[2]/2 + 0.002]} castShadow>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <mesh position={[0, -size[1]/4, size[2]/2 + 0.002]} castShadow>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <mesh position={[size[0]/4, -size[1]/4, size[2]/2 + 0.002]} castShadow>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </group>
        </group>
    );
});

Player.displayName = 'Player';

export default Player;