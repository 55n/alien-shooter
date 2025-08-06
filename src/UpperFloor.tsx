import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { usePhysicsWorld } from './Physics';

interface UpperFloorProps {
    position?: [number, number, number];
    size?: [number, number];
    thickness?: number;
    color?: string;
    hasRailing?: boolean;
}

function UpperFloor({
    position = [0, 2, 0],
    size = [6, 6],
    thickness = 0.1,
    color = '#666666',
    hasRailing = true,
}: UpperFloorProps) {
    const world = usePhysicsWorld();
    const floorRef = useRef<THREE.Mesh>(null);
    const bodyRef = useRef<CANNON.Body | null>(null);

    useEffect(() => {
        const floorPhysicsY = position[1] + thickness / 2; // Top surface of floor
        console.log('Floor physics created at:', {
            position: [position[0], floorPhysicsY, position[2]],
            size: [size[0], thickness, size[1]],
        });

        // Create physics body
        const shape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, thickness / 2, size[1] / 2));
        const body = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(position[0], floorPhysicsY, position[2]),
            shape: shape,
            material: new CANNON.Material({
                friction: 0.8,
                restitution: 0.1,
            }),
        });

        bodyRef.current = body;
        world.addBody(body);

        return () => {
            if (bodyRef.current) {
                world.removeBody(bodyRef.current);
            }
        };
    }, [world, position, size, thickness]);

    useFrame(() => {
        // Sync mesh position with physics body
        if (floorRef.current && bodyRef.current) {
            floorRef.current.position.copy(bodyRef.current.position as any);
            floorRef.current.quaternion.copy(bodyRef.current.quaternion as any);
        }
    });

    const railingHeight = 1.2;
    const railingThickness = 0.1;
    const railingPositions = [
        // Left and right side railings (full length)
        {
            pos: [position[0] - size[0] / 2, position[1] + railingHeight / 2, position[2]],
            size: [railingThickness, railingHeight, size[1]],
        },
        {
            pos: [position[0] + size[0] / 2, position[1] + railingHeight / 2, position[2]],
            size: [railingThickness, railingHeight, size[1]],
        },

        // Back railing (full width)
        {
            pos: [position[0], position[1] + railingHeight / 2, position[2] + size[1] / 2],
            size: [size[0], railingHeight, railingThickness],
        },
        // No front railing - this is where stairs connect
    ];

    return (
        <group>
            {/* Main floor with physics */}
            <mesh
                ref={floorRef}
                castShadow
                receiveShadow
                userData={{ interactable: false, type: 'floor' }}
            >
                <boxGeometry args={[size[0], thickness, size[1]]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Visual border to show floor edges */}
            <lineSegments position={[position[0], position[1] + 0.01, position[2]]}>
                <edgesGeometry args={[new THREE.BoxGeometry(size[0], 0.02, size[1])]} />
                <lineBasicMaterial color="#ffffff" linewidth={2} />
            </lineSegments>

            {/* Railings */}
            {hasRailing &&
                railingPositions.map((railing, index) => (
                    <Railing
                        key={index}
                        position={railing.pos as [number, number, number]}
                        size={railing.size as [number, number, number]}
                        color="#444444"
                    />
                ))}
        </group>
    );
}

interface RailingProps {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
}

function Railing({ position, size, color }: RailingProps) {
    const world = usePhysicsWorld();
    const meshRef = useRef<THREE.Mesh>(null);
    const bodyRef = useRef<CANNON.Body | null>(null);

    useEffect(() => {
        // Create physics body
        const shape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
        const body = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(...position),
            shape: shape,
            material: new CANNON.Material({
                friction: 0.5,
                restitution: 0.1,
            }),
        });

        bodyRef.current = body;
        world.addBody(body);

        return () => {
            if (bodyRef.current) {
                world.removeBody(bodyRef.current);
            }
        };
    }, [world, position, size]);

    useFrame(() => {
        // Sync mesh position with physics body
        if (meshRef.current && bodyRef.current) {
            meshRef.current.position.copy(bodyRef.current.position as any);
            meshRef.current.quaternion.copy(bodyRef.current.quaternion as any);
        }
    });

    return (
        <mesh
            ref={meshRef}
            castShadow
            receiveShadow
            userData={{ interactable: false, type: 'railing' }}
        >
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default UpperFloor;
