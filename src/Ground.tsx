import * as Cannon from 'cannon-es';
import { useEffect, useRef } from 'react';
import * as Three from 'three';
import { usePhysicsWorld } from './Physics';

interface GroundProps {
    size?: [number, number];
    thickness?: number;
    color?: string;
}

function Ground({ size = [20, 20], thickness = 0.1, color = '#884949' }: GroundProps) {
    const world = usePhysicsWorld();
    const meshRef = useRef<Three.Mesh>(null);
    const bodyRef = useRef<Cannon.Body | null>(null);

    useEffect(() => {
        // Create physics body
        const shape = new Cannon.Plane();
        const body = new Cannon.Body({
            mass: 0, // Static body
            position: new Cannon.Vec3(0, 0, 0),
            shape: shape,
        });

        body.quaternion.setFromAxisAngle(new Cannon.Vec3(1, 0, 0), - Math.PI / 2);

        bodyRef.current = body;
        world.addBody(body);

        return () => {
            if (bodyRef.current) {
                world.removeBody(bodyRef.current);
            }
        };
    }, [world, size, thickness]);

    useEffect(() => {
        if (meshRef.current && bodyRef.current) {
            // meshRef.current.quaternion.setFromAxisAngle(new Three.Vector3(1, 0, 0), - Math.PI / 2);
            meshRef.current.quaternion.copy(bodyRef.current.quaternion)
        }
    });


    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[140, 140]} />
            <meshStandardMaterial />
        </mesh>
    );

}

export default Ground;
