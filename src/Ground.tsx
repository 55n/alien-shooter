import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { usePhysicsWorld } from './Physics';

interface GroundProps {
    size?: [number, number];
    thickness?: number;
    color?: string;
}

function Ground({ size = [20, 20], thickness = 0.1, color = '#888888' }: GroundProps) {
    const world = usePhysicsWorld();
    const meshRef = useRef<THREE.Mesh>(null);
    const bodyRef = useRef<CANNON.Body | null>(null);

    useEffect(() => {
        // Create physics body
        const shape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, thickness / 2, size[1] / 2));
        const body = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(0, -thickness / 2, 0),
            shape: shape,
        });

        bodyRef.current = body;
        world.addBody(body);

        return () => {
            if (bodyRef.current) {
                world.removeBody(bodyRef.current);
            }
        };
    }, [world, size, thickness]);

    useFrame(() => {
        // Sync mesh position with physics body
        if (meshRef.current && bodyRef.current) {
            meshRef.current.position.copy(bodyRef.current.position as any);
            meshRef.current.quaternion.copy(bodyRef.current.quaternion as any);
        }
    });

    return (
        <group>
            {/* Main ground platform */}
            <mesh ref={meshRef} receiveShadow userData={{ interactable: false, type: 'ground' }}>
                <boxGeometry args={[size[0], thickness, size[1]]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Visual border to show ground edges */}
            <lineSegments position={[0, 0.01, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(size[0], 0.02, size[1])]} />
                <lineBasicMaterial color="#ffffff" linewidth={2} />
            </lineSegments>
        </group>
    );
}

export default Ground;
