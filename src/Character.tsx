import { usePhysicsWorld } from "@/Physics";
import { useFrame } from "@react-three/fiber";
import * as Cannon from "cannon-es";
import { useEffect, useRef } from "react";
import * as Three from "three";

interface CharacterData {
    type: string
}

const Character = ({ userData }: { userData?: CharacterData }) => {
    const world = usePhysicsWorld();
    const meshRef = useRef<Three.Mesh>(null);
    const bodyRef = useRef<Cannon.Body>(null);

    useEffect(() => {
        // Body
        const mass = 1;
        const body = new Cannon.Body({
            mass: mass,
            fixedRotation: true,
            linearDamping: 1,
            angularDamping: 0.8 
        });

        const cylinderRadius = 0.5;
        const cylinderHeight = 1;
        const cylinderShape = new Cannon.Cylinder(cylinderRadius, cylinderRadius, cylinderHeight, 16);

        const sphereRadius = 0.5;
        const sphereShape = new Cannon.Sphere(sphereRadius);

        body.addShape(cylinderShape, new Cannon.Vec3(0, 0, 0));

        body.addShape(sphereShape, new Cannon.Vec3(0, cylinderHeight / 2, 0));

        body.addShape(sphereShape, new Cannon.Vec3(0, -cylinderHeight / 2, 0));

        bodyRef.current = body;
        world.addBody(body);
    }, []);

    useFrame(() => {
        if (meshRef.current && bodyRef.current) {
            meshRef.current.position.copy(bodyRef.current.position);
            meshRef.current.quaternion.copy(bodyRef.current.quaternion);
        }
    }, 0);


    return (
        <mesh ref={meshRef} userData={userData}>
            <boxGeometry args={[]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}