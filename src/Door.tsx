import { useFrame } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import { useEffect, useRef, useState } from 'react';
import { Group } from 'three';
import { usePhysicsWorld } from './physics/Physics';

interface DoorProps {
    position?: [number, number, number];
    size?: [number, number, number]; // width, height, depth
    color?: string;
    frameColor?: string;
    openAngle?: number; // degrees to rotate when open
}

function Door({
    position = [0, 1, 0],
    size = [1.2, 2, 0.1],
    color = '#8B4513',
    frameColor = '#654321',
    openAngle = 90,
}: DoorProps) {
    const world = usePhysicsWorld();
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const groupRef = useRef<Group>(null);
    const currentRotation = useRef(0);
    const targetRotation = useRef(0);
    const doorBodyRef = useRef<CANNON.Body | null>(null);
    const frameBodyRef = useRef<CANNON.Body | null>(null);

    const frameThickness = 0.1;
    const frameWidth = size[0] + frameThickness * 2;
    const frameHeight = size[1] + frameThickness;

    // Create physics bodies
    useEffect(() => {
        // Door physics body
        const doorShape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
        const doorBody = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(...position),
            shape: doorShape,
            material: new CANNON.Material({
                friction: 0.5,
                restitution: 0.1,
            }),
        });

        // Door frame physics body
        const frameShape = new CANNON.Box(
            new CANNON.Vec3(frameWidth / 2, frameHeight / 2, frameThickness / 2)
        );
        const frameBody = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(...position),
            shape: frameShape,
            material: new CANNON.Material({
                friction: 0.5,
                restitution: 0.1,
            }),
        });

        doorBodyRef.current = doorBody;
        frameBodyRef.current = frameBody;
        world.addBody(doorBody);
        world.addBody(frameBody);

        return () => {
            if (doorBodyRef.current) {
                world.removeBody(doorBodyRef.current);
            }
            if (frameBodyRef.current) {
                world.removeBody(frameBodyRef.current);
            }
        };
    }, [world, position, size, frameWidth, frameHeight, frameThickness]);

    // Interactive door panel (no physics - visual only, will be controlled by animation)
    const handleInteraction = () => {
        if (isAnimating) return;

        setIsAnimating(true);
        setIsOpen(!isOpen);
        targetRotation.current = isOpen ? 0 : (openAngle * Math.PI) / 180;

        console.log(`${isOpen ? 'Closing' : 'Opening'} door...`);
    };

    // Update physics body position when door opens/closes
    useEffect(() => {
        if (!isAnimating && doorBodyRef.current) {
            // When door is fully closed, enable collision
            // When door is open, disable collision by moving physics body out of the way
            const offset = isOpen ? 10 : 0; // Move physics body away when open
            doorBodyRef.current.position.set(position[0] + offset, position[1], position[2]);
        }
    }, [isOpen, isAnimating, position]);

    // Animation loop
    useFrame(() => {
        if (!isAnimating || !groupRef.current) return;

        const rotationSpeed = 3; // radians per second
        const rotationDelta = rotationSpeed * 0.016; // assuming 60fps

        if (Math.abs(currentRotation.current - targetRotation.current) > 0.01) {
            // Animate towards target rotation
            if (currentRotation.current < targetRotation.current) {
                currentRotation.current = Math.min(
                    currentRotation.current + rotationDelta,
                    targetRotation.current
                );
            } else {
                currentRotation.current = Math.max(
                    currentRotation.current - rotationDelta,
                    targetRotation.current
                );
            }

            groupRef.current.rotation.y = currentRotation.current;
        } else {
            // Animation complete
            currentRotation.current = targetRotation.current;
            groupRef.current.rotation.y = currentRotation.current;
            setIsAnimating(false);
        }
    });

    return (
        <group position={position}>
            {/* Door Frame (physics body handled separately) */}
            <mesh castShadow receiveShadow userData={{ interactable: false, type: 'doorframe' }}>
                <boxGeometry args={[frameWidth, frameHeight, frameThickness]} />
                <meshStandardMaterial color={frameColor} />
            </mesh>

            {/* Door frame visual details */}
            <group>
                {/* Top frame */}
                <mesh
                    position={[0, frameHeight / 2 - frameThickness / 2, 0]}
                    castShadow
                    receiveShadow
                    userData={{ interactable: false, type: 'doorframe' }}
                >
                    <boxGeometry args={[frameWidth, frameThickness, frameThickness + 0.02]} />
                    <meshStandardMaterial color={frameColor} />
                </mesh>

                {/* Left frame */}
                <mesh
                    position={[-frameWidth / 2 + frameThickness / 2, 0, 0]}
                    castShadow
                    receiveShadow
                    userData={{ interactable: false, type: 'doorframe' }}
                >
                    <boxGeometry args={[frameThickness, frameHeight, frameThickness + 0.02]} />
                    <meshStandardMaterial color={frameColor} />
                </mesh>

                {/* Right frame */}
                <mesh
                    position={[frameWidth / 2 - frameThickness / 2, 0, 0]}
                    castShadow
                    receiveShadow
                    userData={{ interactable: false, type: 'doorframe' }}
                >
                    <boxGeometry args={[frameThickness, frameHeight, frameThickness + 0.02]} />
                    <meshStandardMaterial color={frameColor} />
                </mesh>
            </group>

            {/* Rotating Door Panel (visual only, no physics during animation) */}
            <group
                ref={groupRef}
                position={[-size[0] / 2 + 0.05, 0, 0]} // Pivot point at left edge
            >
                <mesh
                    position={[size[0] / 2, 0, 0]} // Offset so door rotates around left edge
                    castShadow
                    receiveShadow
                    userData={{
                        interactable: true,
                        type: 'door',
                        onInteract: handleInteraction,
                        name: isOpen ? 'Close Door' : 'Open Door',
                    }}
                    onClick={handleInteraction}
                >
                    <boxGeometry args={[size[0] - 0.1, size[1] - 0.1, size[2]]} />
                    <meshStandardMaterial color={color} />
                </mesh>

                {/* Door handle */}
                <mesh
                    position={[size[0] - 0.15, 0, size[2] / 2 + 0.02]}
                    castShadow
                    userData={{ interactable: false, type: 'doorhandle' }}
                >
                    <sphereGeometry args={[0.04]} />
                    <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Door panels decoration */}
                <mesh
                    position={[size[0] / 2, size[1] / 4, size[2] / 2 + 0.005]}
                    userData={{ interactable: false, type: 'decoration' }}
                >
                    <boxGeometry args={[size[0] - 0.3, size[1] / 3, 0.01]} />
                    <meshStandardMaterial color={frameColor} />
                </mesh>
                <mesh
                    position={[size[0] / 2, -size[1] / 4, size[2] / 2 + 0.005]}
                    userData={{ interactable: false, type: 'decoration' }}
                >
                    <boxGeometry args={[size[0] - 0.3, size[1] / 3, 0.01]} />
                    <meshStandardMaterial color={frameColor} />
                </mesh>
            </group>
        </group>
    );
}

export default Door;
