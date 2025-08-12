import { groundMaterial } from '@/physics/Material';
import { usePhysicsWorld } from '@/physics/Physics';
import * as Cannon from 'cannon-es';
import { useEffect, useRef } from 'react';
import * as Three from 'three';

interface GroundProps {
    size: [number, number, number];
    thickness?: number;
    color?: string;
}

function Ground(props: GroundProps) {
    const world = usePhysicsWorld();
    const meshRef = useRef<Three.Mesh>(null);
    const bodyRef = useRef<Cannon.Body | null>(null);

    useEffect(() => {
        // Create physics body
        const shape = new Cannon.Box(new Cannon.Vec3(props.size[0] / 2, props.size[1], props.size[2] / 2));
        const body = new Cannon.Body({
            mass: 0, // Static body
            position: new Cannon.Vec3(0, -1, 0),
            shape: shape,
            material: groundMaterial
        });

        // body.quaternion.setFromAxisAngle(new Cannon.Vec3(1, 0, 0), - Math.PI / 2);

        bodyRef.current = body;
        world.addBody(body);

        return () => {
            if (bodyRef.current) {
                world.removeBody(bodyRef.current);
            }
        };
    }, [world, props.size, props.thickness]);

    useEffect(() => {
        if (meshRef.current && bodyRef.current) {
            meshRef.current.quaternion.copy(bodyRef.current.quaternion)
        }
    });


    return (
        <mesh ref={meshRef} position={[0, -1, 0]} name='ground'>
            <boxGeometry args={props.size} />
            <meshStandardMaterial />
        </mesh>
    );

}

export default Ground;
