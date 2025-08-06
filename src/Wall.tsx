import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { usePhysicsWorld } from './Physics';

interface WallProps {
    position: [number, number, number];
    size: [number, number, number]; // width, height, depth
    color?: string;
    hasOpening?: boolean;
    openingSize?: [number, number]; // width, height of opening
    openingPosition?: number; // position along the wall (-1 to 1, 0 = center)
}

function Wall({
    position,
    size,
    color = '#8B8B8B',
    hasOpening = false,
    openingSize = [2, 2.5],
    openingPosition = 0,
}: WallProps) {
    if (!hasOpening) {
        return <WallSegment position={position} size={size} color={color} />;
    }

    // Wall with opening (door/window)
    const wallWidth = size[0];
    const wallHeight = size[1];
    const wallDepth = size[2];

    const openingWidth = openingSize[0];
    const openingHeight = openingSize[1];

    // Calculate opening position along the wall
    const openingOffset = (wallWidth / 2) * openingPosition;

    // Calculate wall segments
    const leftWallWidth = (wallWidth - openingWidth) / 2 + openingOffset;
    const rightWallWidth = (wallWidth - openingWidth) / 2 - openingOffset;
    const topWallHeight = wallHeight - openingHeight;

    const components = [];

    // Left wall segment (if needed)
    if (leftWallWidth > 0.1) {
        components.push(
            <WallSegment
                key="left"
                position={[
                    position[0] - wallWidth / 2 + leftWallWidth / 2,
                    position[1],
                    position[2],
                ]}
                size={[leftWallWidth, wallHeight, wallDepth]}
                color={color}
            />
        );
    }

    // Right wall segment (if needed)
    if (rightWallWidth > 0.1) {
        components.push(
            <WallSegment
                key="right"
                position={[
                    position[0] + wallWidth / 2 - rightWallWidth / 2,
                    position[1],
                    position[2],
                ]}
                size={[rightWallWidth, wallHeight, wallDepth]}
                color={color}
            />
        );
    }

    // Top wall segment (above opening)
    if (topWallHeight > 0.1) {
        components.push(
            <WallSegment
                key="top"
                position={[
                    position[0] + openingOffset,
                    position[1] + openingHeight / 2 + topWallHeight / 2,
                    position[2],
                ]}
                size={[openingWidth, topWallHeight, wallDepth]}
                color={color}
            />
        );
    }

    return <group>{components}</group>;
}

interface WallSegmentProps {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
}

function WallSegment({ position, size, color }: WallSegmentProps) {
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
                friction: 0.7,
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
            userData={{ interactable: false, type: 'wall' }}
        >
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default Wall;
