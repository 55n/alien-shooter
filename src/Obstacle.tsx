import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { usePhysicsWorld } from './Physics';

interface ObstacleProps {
    position: [number, number, number];
    size?: number;
    color?: string;
    interactable?: boolean;
}

function Obstacle({ position, size = 2, color = '#8866ff', interactable = true }: ObstacleProps) {
    const world = usePhysicsWorld();
    const meshRef = useRef<THREE.Mesh>(null);
    const bodyRef = useRef<CANNON.Body | null>(null);

    const halfSize = size / 2;
    const adjustedPosition: [number, number, number] = [
        position[0],
        position[1] + halfSize,
        position[2],
    ];

    useEffect(() => {
        // Create physics body
        const shape = new CANNON.Box(new CANNON.Vec3(halfSize, halfSize, halfSize));
        const body = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(...adjustedPosition),
            shape: shape,
        });

        bodyRef.current = body;
        world.addBody(body);

        return () => {
            if (bodyRef.current) {
                world.removeBody(bodyRef.current);
            }
        };
    }, [world, adjustedPosition, halfSize]);

    useFrame(() => {
        // Sync mesh position with physics body
        if (meshRef.current && bodyRef.current) {
            meshRef.current.position.copy(bodyRef.current.position as any);
            meshRef.current.quaternion.copy(bodyRef.current.quaternion as any);
        }
    });

    return (
        <mesh ref={meshRef} castShadow receiveShadow userData={{ interactable, type: 'obstacle' }}>
            <boxGeometry args={[size, size, size]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default Obstacle;
