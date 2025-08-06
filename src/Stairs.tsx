import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { usePhysicsWorld } from './Physics';

interface StairsProps {
    position?: [number, number, number];
    stepCount?: number;
    stepWidth?: number;
    stepDepth?: number;
    stepHeight?: number;
    totalWidth?: number;
    color?: string;
}

function Stairs({
    position = [0, 0, 0],
    stepCount = 8,
    stepWidth: _stepWidth = 3,
    stepDepth = 0.3,
    stepHeight = 0.2,
    totalWidth = 2,
    color = '#606060',
}: StairsProps) {
    const steps = [];

    for (let i = 0; i < stepCount; i++) {
        const stepY = position[1] + (i + 0.5) * stepHeight;
        const stepZ = position[2] + i * stepDepth;

        steps.push(
            <Step
                key={i}
                position={[position[0], stepY, stepZ]}
                size={[totalWidth, stepHeight, stepDepth]}
                color={color}
            />
        );
    }

    return <group>{steps}</group>;
}

interface StepProps {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
}

function Step({ position, size, color }: StepProps) {
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
            userData={{ interactable: false, type: 'stair' }}
        >
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default Stairs;
